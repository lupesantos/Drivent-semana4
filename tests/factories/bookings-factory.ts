import { prisma } from "@/config";
import { createUser } from "./users-factory";
import { createRooms } from "./hotels-factory";

export async function createBooking({ userId, roomId }: BookingParams) {
  const userId2 = userId || (await createUser()).id;
  const roomId2 = roomId || (await createRooms()).id;

  return prisma.booking.create({
    data: {
      userId: userId2,
      roomId: roomId2,
    },
  });
}

interface BookingParams {
  userId?: number;
  roomId?: number;
}
