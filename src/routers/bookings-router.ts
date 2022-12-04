import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getHotels, getHotelsWithRooms } from "@/controllers";
import { getBookings, postBookings, putBookings } from "@/controllers/booking-controller";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("/", getBookings)
  .post("/", postBookings)
  .put("/:bookingId", putBookings);

export { bookingRouter };
