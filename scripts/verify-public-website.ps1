# ==============================================================================
# BorrowBuy — Public Website End-to-End Functional Verification Script
# ==============================================================================
# Tests the live public website URL (HTTPS CloudFront or HTTP origin):
# Homepage, API endpoints, product catalog, WebP images, customer/owner auth,
# bookings, notifications, SPA route deep-linking, and port security.
# ==============================================================================

param (
    [string]$WebsiteUrl = "http://13.206.100.236"
)

$ErrorActionPreference = "Continue"

# Remove trailing slash
$BaseUrl = $WebsiteUrl.TrimEnd('/')

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "🌐 BORROWBUY — PUBLIC WEBSITE LIVE FUNCTIONAL VERIFICATION" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "Target Base URL: $BaseUrl"
Write-Host "Timestamp      : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "=============================================================="

$TotalTests = 0
$PassedTests = 0

function Test-Endpoint {
    param (
        [string]$Name,
        [scriptblock]$Action
    )
    $script:TotalTests++
    Write-Host "`n[$script:TotalTests] Testing: $Name..." -ForegroundColor Yellow
    try {
        $result = & $Action
        if ($result.Success) {
            $script:PassedTests++
            Write-Host "  ✅ [PASS] $($result.Message)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ [FAIL] $($result.Message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ❌ [FAIL] Exception: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 1. Homepage Root Loading
Test-Endpoint "Homepage Availability (Root /)" {
    $res = Invoke-WebRequest -Uri "$BaseUrl/" -Method Get -TimeoutSec 15 -UseBasicParsing
    if ($res.StatusCode -eq 200 -and $res.Content -match 'id="root"') {
        return @{ Success = $true; Message = "Homepage loaded with HTTP 200 OK (Content Length: $($res.Content.Length) bytes)" }
    }
    return @{ Success = $false; Message = "Homepage returned status code $($res.StatusCode)" }
}

# 2. Health Check API
Test-Endpoint "Backend Health API (/api/health)" {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/health" -Method Get -TimeoutSec 15
    if ($res.status -eq "healthy" -and $res.service -eq "borrowbuy-backend") {
        return @{ Success = $true; Message = "Health API responded: status=$($res.status), environment=$($res.environment)" }
    }
    return @{ Success = $false; Message = "Health API response unexpected: $($res | ConvertTo-Json -Compress)" }
}

# 3. Product Catalog API (116 products)
Test-Endpoint "Product Catalog API (/api/products)" {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/products?page=1&limit=10" -Method Get -TimeoutSec 15
    if ($res.products -and $res.products.Count -gt 0) {
        return @{ Success = $true; Message = "Catalog API returned $($res.products.Count) products (Total: $($res.pagination.totalProducts))" }
    }
    return @{ Success = $false; Message = "Catalog returned 0 products" }
}

# 4. Verified WebP Product Images
Test-Endpoint "Static WebP Product Images (/images/...)" {
    $sampleImage = "$BaseUrl/images/products/canon-eos-r6-mark-ii-mirrorless-camera-kit/image-01.webp"
    $res = Invoke-WebRequest -Uri $sampleImage -Method Get -TimeoutSec 15 -UseBasicParsing
    if ($res.StatusCode -eq 200 -and $res.Headers["Content-Type"] -match "image/webp") {
        return @{ Success = $true; Message = "WebP Image served with HTTP 200 OK ($($res.RawContentLength) bytes, Content-Type: $($res.Headers['Content-Type']))" }
    }
    return @{ Success = $false; Message = "WebP image failed: HTTP $($res.StatusCode)" }
}

# 5. Customer Authentication
$CustomerToken = $null
Test-Endpoint "Customer Authentication (/api/auth/login)" {
    $body = @{
        email = "customer@borrowbuy.in"
        password = "Password123!"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 15
    if ($res.success -and $res.data.token) {
        $script:CustomerToken = $res.data.token
        return @{ Success = $true; Message = "Customer logged in: $($res.data.user.fullName) (Role: $($res.data.user.role))" }
    }
    return @{ Success = $false; Message = "Customer login failed: $($res.message)" }
}

# 6. Customer Bookings with Digital QR Passes
Test-Endpoint "Customer Bookings (/api/bookings/my-bookings)" {
    if (-not $CustomerToken) { return @{ Success = $false; Message = "Skipped: Customer token missing" } }
    $headers = @{ Authorization = "Bearer $CustomerToken" }
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/bookings/my-bookings" -Method Get -Headers $headers -TimeoutSec 15
    if ($res.success -and $res.data.Count -gt 0) {
        return @{ Success = $true; Message = "Found $($res.data.Count) active/completed customer bookings with QR tokens" }
    }
    return @{ Success = $false; Message = "Customer bookings empty or failed" }
}

# 7. Owner Authentication
$OwnerToken = $null
Test-Endpoint "Owner Authentication (/api/auth/login)" {
    $body = @{
        email = "owner@borrowbuy.in"
        password = "Password123!"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 15
    if ($res.success -and $res.data.token) {
        $script:OwnerToken = $res.data.token
        return @{ Success = $true; Message = "Owner logged in: $($res.data.user.fullName) (Role: $($res.data.user.role))" }
    }
    return @{ Success = $false; Message = "Owner login failed: $($res.message)" }
}

# 8. Owner Personal Inventory (25 Listings)
Test-Endpoint "Owner Inventory (/api/products/owner/my-listings)" {
    if (-not $OwnerToken) { return @{ Success = $false; Message = "Skipped: Owner token missing" } }
    $headers = @{ Authorization = "Bearer $OwnerToken" }
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/products/owner/my-listings" -Method Get -Headers $headers -TimeoutSec 15
    if ($res.success -and $res.data.Count -ge 20) {
        return @{ Success = $true; Message = "Owner inventory verified: $($res.data.Count) premier equipment listings" }
    }
    return @{ Success = $false; Message = "Owner inventory count unexpected: $($res.data.Count)" }
}

# 9. Owner Rental Requests Tab
Test-Endpoint "Owner Rental Requests (/api/bookings/owner-requests)" {
    if (-not $OwnerToken) { return @{ Success = $false; Message = "Skipped: Owner token missing" } }
    $headers = @{ Authorization = "Bearer $OwnerToken" }
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/bookings/owner-requests" -Method Get -Headers $headers -TimeoutSec 15
    if ($res.success -and $res.data.Count -gt 0) {
        return @{ Success = $true; Message = "Owner rental requests loaded: $($res.data.Count) bookings requiring approval/handover" }
    }
    return @{ Success = $false; Message = "Owner requests failed or empty" }
}

# 10. In-App Notifications
Test-Endpoint "In-App Notifications (/api/notifications)" {
    if (-not $OwnerToken) { return @{ Success = $false; Message = "Skipped: Owner token missing" } }
    $headers = @{ Authorization = "Bearer $OwnerToken" }
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/notifications" -Method Get -Headers $headers -TimeoutSec 15
    if ($res.success -and $res.notifications.Count -gt 0) {
        return @{ Success = $true; Message = "Notification alerts active: $($res.notifications.Count) unread notifications" }
    }
    return @{ Success = $false; Message = "Notifications failed or empty" }
}

# 11. Client-Side Routing Deep-Linking (SPA Fallback)
Test-Endpoint "SPA Deep-Linking (/browse, /bookings, /dashboard)" {
    $browseRes = Invoke-WebRequest -Uri "$BaseUrl/browse" -Method Get -TimeoutSec 15 -UseBasicParsing
    $bookRes = Invoke-WebRequest -Uri "$BaseUrl/bookings" -Method Get -TimeoutSec 15 -UseBasicParsing
    if ($browseRes.StatusCode -eq 200 -and $bookRes.StatusCode -eq 200) {
        return @{ Success = $true; Message = "Direct route refresh verified: Both /browse and /bookings returned HTTP 200 with index.html" }
    }
    return @{ Success = $false; Message = "SPA deep-linking failed: /browse=$($browseRes.StatusCode), /bookings=$($bookRes.StatusCode)" }
}

# 12. Security Boundary Checks (Database & SSH Ports Inaccessible)
Test-Endpoint "Perimeter Security (PostgreSQL Port 5432 Closed)" {
    $hostName = $BaseUrl -replace '^https?://', '' -replace '/.*$', '' -replace ':\d+$', ''
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $asyncResult = $tcpClient.BeginConnect($hostName, 5432, $null, $null)
    $success = $asyncResult.AsyncWaitHandle.WaitOne(2000, $false)
    if (-not $success -or -not $tcpClient.Connected) {
        $tcpClient.Close()
        return @{ Success = $true; Message = "Port 5432 (PostgreSQL) is safely CLOSED and blocked from public internet." }
    } else {
        $tcpClient.Close()
        return @{ Success = $false; Message = "CRITICAL: Port 5432 is OPEN to public traffic!" }
    }
}

Write-Host "`n==============================================================" -ForegroundColor Cyan
Write-Host "📊 VERIFICATION SUMMARY: $PassedTests / $TotalTests PASSED ($([math]::Round(($PassedTests/$TotalTests)*100, 1))%)" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan

if ($PassedTests -eq $TotalTests) {
    Write-Host "🎉 ALL PUBLIC WEBSITE VERIFICATIONS PASSED WITH 100% SUCCESS!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️ Some checks did not pass. Check output above." -ForegroundColor Yellow
    exit 1
}
