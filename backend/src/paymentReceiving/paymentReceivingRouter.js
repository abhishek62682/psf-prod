import express from "express";
import { getDefaultAccount } from "./paymentReceivingController.js";

const paymentReceivingRouter = express.Router();

// ----- Public -----
// This account is fixed — see scripts/seedPaymentReceiving.js for how to
// create/change it. There is no write API for it.
paymentReceivingRouter.get("/", getDefaultAccount);

export default paymentReceivingRouter;
