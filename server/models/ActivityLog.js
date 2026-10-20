import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    targetModel: {
        type: String, // "User", "Department", "Leave"
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    details: {
        type: String,
    },
}, { timestamps: true });

export default mongoose.model("ActivityLog", activityLogSchema);