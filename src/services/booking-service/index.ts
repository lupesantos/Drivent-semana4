import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError, forbiddenError, unauthorizedError } from "@/errors";
import { cannotListHotelsError } from "@/errors/cannot-list-hotels-error";
import bookingRepository from "@/repositories/booking-repository";
import { forbidden } from "joi";

async function listBookings(userId: number) {
  //Tem enrollment?
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  //Tem ticket pago isOnline false e includesHotel true
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket) {
    throw notFoundError();
  }

  if (ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw cannotListHotelsError();
  }
}

async function getBookings(userId: number) {
  await listBookings(userId);

  const booking = await bookingRepository.findBookings(userId);

  if (!booking) {
    throw notFoundError();
  }

  return booking;
}

async function postBookings(userId: number, roomId: number) {
  await listBookings(userId);
  const room = await bookingRepository.findRoomByRoomId(roomId);

  if (!room) {
    throw notFoundError();
  }
  await verifyIfRoomIsFull(roomId);
  const booking = await bookingRepository.createBooking(userId, roomId);

  return booking;
}

async function putBookings(userId: number, roomId: number, bookingId: number, newRoomId: number) {
  await listBookings(userId);
  const room = await bookingRepository.findRoomByRoomId(roomId);

  if (!room) {
    throw notFoundError();
  }
  const booking = await verifyValidParamsBookingId(bookingId, userId);
  const newBooking = await bookingRepository.updateBooking(bookingId, newRoomId);

  return newBooking;
}

async function verifyValidParamsBookingId(bookingId: number, userId: number) {
  const bookingByParams = await bookingRepository.findBookingByBookingId(bookingId);

  if (!bookingByParams) {
    throw notFoundError();
  }

  const booking = await bookingRepository.findBookings(userId);
  if (!booking) {
    throw notFoundError();
  }

  if (bookingByParams.id !== booking.id) {
    throw unauthorizedError();
  }

  return booking;
}

async function verifyIfRoomIsFull(roomId: number) {
  const room = await bookingRepository.findRoomByRoomId(roomId);

  if (room.capacity === room.Booking.length) {
    throw forbiddenError();
  }
  return false;
}

async function getRoomByRoomId(roomId: number) {
  const room = await bookingRepository.findRoomByRoomId(roomId);

  if (!room) {
    throw notFoundError();
  }

  if (room.capacity === room.Booking.length) {
    throw forbiddenError();
  }

  return room;
}

const bookingService = {
  getBookings,
  postBookings,
  putBookings,
  getRoomByRoomId,
};

export default bookingService;
