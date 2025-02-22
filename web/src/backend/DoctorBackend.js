import * as Setting from "../Setting";

export function getDoctors(owner, page = "", pageSize = "", field = "", value = "", sortField = "", sortOrder = "") {
  return fetch(`${Setting.ServerUrl}/api/get-doctors?owner=${owner}&p=${page}&pageSize=${pageSize}&field=${field}&value=${value}&sortField=${sortField}&sortOrder=${sortOrder}`, {
    method: "GET",
    credentials: "include",
  }).then(res => res.json());
}

export function getDoctor(owner, name) {
  return fetch(`${Setting.ServerUrl}/api/get-doctor?id=${owner}/${encodeURIComponent(name)}`, {
    method: "GET",
    credentials: "include",
  }).then(res => res.json());
}

export function updateDoctor(owner, name, doctorData) {
  const newDoctor = Setting.deepCopy(doctorData);
  return fetch(`${Setting.ServerUrl}/api/update-doctor?id=${owner}/${encodeURIComponent(name)}`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(newDoctor),
  }).then(res => res.json());
}

export function addDoctor(doctorData) {
  const newDoctor = Setting.deepCopy(doctorData);
  return fetch(`${Setting.ServerUrl}/api/add-doctor`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(newDoctor),
  }).then(res => res.json());
}

export function deleteDoctor(doctorData) {
  const newDoctor = Setting.deepCopy(doctorData);
  return fetch(`${Setting.ServerUrl}/api/delete-doctor`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(newDoctor),
  }).then(res => res.json());
}
