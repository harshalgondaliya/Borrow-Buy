import { BookingStatus } from '@prisma/client';

export class BookingStateMachine {
  private static readonly VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.PENDING]: [
      BookingStatus.RESERVED,
      BookingStatus.CANCELLED,
      BookingStatus.EXPIRED,
    ],
    [BookingStatus.RESERVED]: [
      BookingStatus.CONFIRMED,
      BookingStatus.CANCELLED,
      BookingStatus.EXPIRED,
    ],
    [BookingStatus.CONFIRMED]: [
      BookingStatus.READY_FOR_PICKUP,
      BookingStatus.ACTIVE,
      BookingStatus.CANCELLED,
    ],
    [BookingStatus.READY_FOR_PICKUP]: [
      BookingStatus.ACTIVE,
      BookingStatus.CANCELLED,
    ],
    [BookingStatus.ACTIVE]: [
      BookingStatus.RETURN_REQUESTED,
      BookingStatus.RETURNED,
      BookingStatus.DISPUTED,
    ],
    [BookingStatus.RETURN_REQUESTED]: [
      BookingStatus.RETURNED,
      BookingStatus.DISPUTED,
    ],
    [BookingStatus.RETURNED]: [
      BookingStatus.COMPLETED,
      BookingStatus.DISPUTED,
    ],
    [BookingStatus.DISPUTED]: [
      BookingStatus.COMPLETED,
    ],
    [BookingStatus.COMPLETED]: [],
    [BookingStatus.CANCELLED]: [],
    [BookingStatus.EXPIRED]: [],
  };

  public static isValidTransition(current: BookingStatus, target: BookingStatus): boolean {
    const allowed = this.VALID_TRANSITIONS[current] || [];
    return allowed.includes(target);
  }

  public static assertValidTransition(current: BookingStatus, target: BookingStatus): void {
    if (!this.isValidTransition(current, target)) {
      throw new Error(
        `Invalid booking state transition: Cannot change status from '${current}' to '${target}'.`
      );
    }
  }
}

