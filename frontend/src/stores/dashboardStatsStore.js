import { useSyncExternalStore } from "react";
import api from "../api/axios";

let snapshot = { status: "idle", data: null, error: "" };
const listeners = new Set();
let inFlight = null;

function emit() {
  listeners.forEach((l) => l());
}

async function load() {
  if (inFlight) return inFlight;
  snapshot = { ...snapshot, status: "loading", error: "" };
  emit();
  inFlight = api
    .get("dashboard/stats/")
    .then((res) => {
      snapshot = { status: "ready", data: res.data, error: "" };
      emit();
    })
    .catch((err) => {
      snapshot = {
        status: "error",
        data: null,
        error: err?.response?.data?.detail || "Failed to load stats",
      };
      emit();
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

function subscribe(listener) {
  listeners.add(listener);
  if (snapshot.status === "idle") load();
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

export function useDashboardStats() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function refreshDashboardStats() {
  snapshot = { status: "idle", data: null, error: "" };
  emit();
  load();
}

