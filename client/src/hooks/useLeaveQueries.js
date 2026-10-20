import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../api/axios";
import { KEYS } from "./queryKeys";

// ── All Leaves (admin/manager) ────────────────────────────────────────────────
export const useLeaves = (params = {}) => {
    const { page = 1, limit = 10, status = "all", search = "" } = params;
    const query = new URLSearchParams({ page, limit });
    if (status !== "all") query.append("status", status);
    if (search) query.append("search", search);

    return useQuery({
        queryKey: KEYS.leaves({ page, limit, status, search }),
        queryFn: () => API.get(`/leaves?${query}`).then(r => r.data),
        placeholderData: (prev) => prev,
        staleTime: 1000 * 30,
    });
};

// ── My Leaves (employee) ──────────────────────────────────────────────────────
export const useMyLeaves = (params = {}) => {
    const { page = 1, limit = 10 } = params;
    return useQuery({
        queryKey: KEYS.myLeaves({ page, limit }),
        queryFn: () => API.get(`/leaves/my?page=${page}&limit=${limit}`).then(r => r.data),
        placeholderData: (prev) => prev,
        staleTime: 1000 * 30,
    });
};

// ── Apply Leave ───────────────────────────────────────────────────────────────
export const useApplyLeave = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => API.post("/leaves", data).then(r => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["leaves"] });
            qc.invalidateQueries({ queryKey: ["admin", "stats"] });
        },
    });
};

// ── Update Leave Status (approve/reject) ──────────────────────────────────────
export const useUpdateLeaveStatus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }) => API.patch(`/leaves/${id}`, { status }).then(r => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["leaves"] });
            qc.invalidateQueries({ queryKey: ["admin", "stats"] });
            qc.invalidateQueries({ queryKey: ["admin", "weekly-leaves"] });
        },
    });
};

// ── Delete Leave ──────────────────────────────────────────────────────────────
export const useDeleteLeave = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => API.delete(`/leaves/${id}`).then(r => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["leaves"] });
            qc.invalidateQueries({ queryKey: ["admin", "stats"] });
        },
    });
};