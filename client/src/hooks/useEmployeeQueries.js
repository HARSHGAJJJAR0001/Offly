import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../api/axios";
import { KEYS } from "./queryKeys";

// ── All Employees (with pagination + filters) ─────────────────────────────────
export const useEmployees = (params = {}) => {
    const { page = 1, limit = 10, search = "", department = "all" } = params;
    const query = new URLSearchParams({ page, limit });
    if (search) query.append("search", search);
    if (department !== "all") query.append("department", department);

    return useQuery({
        queryKey: KEYS.employees({ page, limit, search, department }),
        queryFn: () => API.get(`/employees?${query}`).then(r => r.data),
        placeholderData: (prev) => prev, // smooth pagination — keep old data while loading new
        staleTime: 1000 * 60,
    });
};

// ── My Profile ────────────────────────────────────────────────────────────────
export const useProfile = () =>
    useQuery({
        queryKey: KEYS.profile(),
        queryFn: () => API.get("/employees/profile").then(r => r.data),
        staleTime: 1000 * 60 * 5,
    });

// ── Add Employee ──────────────────────────────────────────────────────────────
export const useAddEmployee = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => API.post("/employees", data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
    });
};

// ── Delete Employee ───────────────────────────────────────────────────────────
export const useDeleteEmployee = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => API.delete(`/employees/${id}`).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
    });
};

// ── Update Employee ───────────────────────────────────────────────────────────
export const useUpdateEmployee = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => API.put(`/employees/${id}`, data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
    });
};

// ── Update Profile ────────────────────────────────────────────────────────────
export const useUpdateProfile = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => API.put("/employees/profile", data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.profile() }),
    });
};

// ── Dept Employees ────────────────────────────────────────────────────────────
export const useDeptEmployees = (deptId) =>
    useQuery({
        queryKey: ["dept-employees", deptId],
        queryFn: () => API.get(`/departments/employees/${deptId}`).then(r => r.data),
        enabled: !!deptId,
        staleTime: 1000 * 60 * 2,
    });