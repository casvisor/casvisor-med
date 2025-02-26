// Copyright 2024 The casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as Setting from "../Setting";

// export function compareBpmn(owner, page = "", pageSize = "", field = "", value = "", sortField = "", sortOrder = "") {
//   return fetch(`${Setting.ServerUrl}/api/compare-bpm?owner=${owner}&p=${page}&pageSize=${pageSize}&field=${field}&value=${value}&sortField=${sortField}&sortOrder=${sortOrder}`, {
//     method: "GET",
//     credentials: "include",
//   }).then(res => res.json());
// }

export function compareBpmn(formData) {
  return fetch(`${Setting.ServerUrl}/api/compare-bpmn`, {
    method: "POST",
    credentials: "include",
    body: formData,
  }).then(res => res.json());
}

export function comparePath(owner, name) {
  return fetch(`${Setting.ServerUrl}/api/get-bpmn?id=${owner}/${encodeURIComponent(name)}`, {
    method: "GET",
    credentials: "include",
  }).then(res => res.json());
}

export function updateBpmn(owner, name, bpmn) {
  const newBpmn = Setting.deepCopy(bpmn);
  return fetch(`${Setting.ServerUrl}/api/update-bpmn?id=${owner}/${encodeURIComponent(name)}`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(newBpmn),
  }).then(res => res.json());
}

export function addBpmn(bpmn) {
  const newBpmn = Setting.deepCopy(bpmn);
  return fetch(`${Setting.ServerUrl}/api/add-bpmn`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(newBpmn),
  }).then(res => res.json());
}

export function deleteBpmn(bpmn) {
  const newBpmn = Setting.deepCopy(bpmn);
  return fetch(`${Setting.ServerUrl}/api/delete-bpmn`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(newBpmn),
  }).then(res => res.json());
}
