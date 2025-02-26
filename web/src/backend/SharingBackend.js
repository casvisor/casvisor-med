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

export function getSharings(owner, page = "", pageSize = "", field = "", value = "", sortField = "", sortOrder = "") {
  return fetch(`${Setting.ServerUrl}/api/get-sharings?owner=${owner}&p=${page}&pageSize=${pageSize}&field=${field}&value=${value}&sortField=${sortField}&sortOrder=${sortOrder}`, {
    method: "GET",
    credentials: "include",
  }).then(res => res.json());
}

export function getSharing(owner, name) {
  return fetch(`${Setting.ServerUrl}/api/get-sharing?id=${owner}/${encodeURIComponent(name)}`, {
    method: "GET",
    credentials: "include",
  }).then(res => res.json());
}

export function updateSharing(owner, name, sharing) {
  const newSharing = Setting.deepCopy(sharing);
  return fetch(`${Setting.ServerUrl}/api/update-sharing?id=${owner}/${encodeURIComponent(name)}`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(newSharing),
  }).then(res => res.json());
}

export function addSharing(sharing) {
  const newSharing = Setting.deepCopy(sharing);
  return fetch(`${Setting.ServerUrl}/api/add-sharing`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(newSharing),
  }).then(res => res.json());
}

export function deleteSharing(sharing) {
  const newSharing = Setting.deepCopy(sharing);
  return fetch(`${Setting.ServerUrl}/api/delete-sharing`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(newSharing),
  }).then(res => res.json());
}

export function commitSharing(sharing) {
  const newSharing = Setting.deepCopy(sharing);
  return fetch(`${Setting.ServerUrl}/api/commit-sharing`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(newSharing),
  }).then(res => res.json());
}

export function querySharing(owner, name) {
  return fetch(`${Setting.ServerUrl}/api/query-sharing?id=${owner}/${encodeURIComponent(name)}`, {
    method: "GET",
    credentials: "include",
  }).then(res => res.json());
}
