const express = require("express");
const {
  registerVendor,
  viewPendingRequests,
  approveRequestsForVendor,
  rejectRequestsForVendor,
  viewPendingRequestsById,
} = require("../controllers/vendor/req.vendor");
const { protect } = require("../middlewares/auth.mid");
const router = express.Router();

router.route("/").post(registerVendor);
router.route("/requests").get(protect, viewPendingRequests);
router.route("/requests/:id").get(protect, viewPendingRequestsById);
router.route("/requests/approve/:id").put(protect, approveRequestsForVendor);
router.route("/requests/reject/:id").put(protect, rejectRequestsForVendor);
module.exports = router;
