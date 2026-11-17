import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { env } from '../../config/env.js';

export class CloudWatchMonitoringService {
  private cwClient: CloudWatchClient;
  private namespace: string;

  constructor() {
    this.namespace = 'BorrowBuy/Application';
    this.cwClient = new CloudWatchClient({
      region: env.AWS_REGION || 'ap-south-1',
    });
  }

  public async recordMetric(
    metricName: string,
    value: number,
    unit: 'Count' | 'Milliseconds' | 'Bytes' = 'Count',
    dimensions: Record<string, string> = {}
  ): Promise<void> {
    try {
      const dimensionList = Object.entries(dimensions).map(([Name, Value]) => ({
        Name,
        Value,
      }));

      const command = new PutMetricDataCommand({
        Namespace: this.namespace,
        MetricData: [
          {
            MetricName: metricName,
            Value: value,
            Unit: unit,
            Timestamp: new Date(),
            Dimensions: [
              ...dimensionList,
              { Name: 'Environment', Value: env.NODE_ENV },
            ],
          },
        ],
      });

      await this.cwClient.send(command);
    } catch (error: any) {
      // In local development or when AWS credentials are not active, log silently
      if (env.NODE_ENV === 'development') {
        // debug trace
      } else {
        console.error(`[CloudWatchMonitoring] Failed to record metric ${metricName}:`, error.message);
      }
    }
  }
}

export const cloudWatchService = new CloudWatchMonitoringService();
