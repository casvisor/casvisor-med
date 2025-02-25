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

export function getConsumers(owner, page = "", pageSize = "", field = "", value = "", sortField = "", sortOrder = "") {
  return fetch(`${Setting.ServerUrl}/api/get-consumers?owner=${owner}&p=${page}&pageSize=${pageSize}&field=${field}&value=${value}&sortField=${sortField}&sortOrder=${sortOrder}`, {
    method: "GET",
    credentials: "include",
  }).then(res => res.json());
}

export function getConsumer(owner, name) {
  return fetch(`${Setting.ServerUrl}/api/get-consumer?id=${owner}/${encodeURIComponent(name)}`, {
    method: "GET",
    credentials: "include",
  }).then(res => res.json());
}

export function updateConsumer(owner, name, consumer) {
  const newConsumer = Setting.deepCopy(consumer);
  return fetch(`${Setting.ServerUrl}/api/update-consumer?id=${owner}/${encodeURIComponent(name)}`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(newConsumer),
  }).then(res => res.json());
}

export function addConsumer(consumer) {
  const newConsumer = Setting.deepCopy(consumer);
  return fetch(`${Setting.ServerUrl}/api/add-consumer`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(newConsumer),
  }).then(res => res.json());
}

export function deleteConsumer(consumer) {
  const newConsumer = Setting.deepCopy(consumer);
  return fetch(`${Setting.ServerUrl}/api/delete-consumer`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(newConsumer),
  }).then(res => res.json());
}

export function commitConsumer(consumer) {
  const newConsumer = Setting.deepCopy(consumer);
  return fetch(`${Setting.ServerUrl}/api/commit-consumer`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(newConsumer),
  }).then(res => res.json());
}

export function queryConsumer(owner, name) {
  return fetch(`${Setting.ServerUrl}/api/query-consumer?id=${owner}/${encodeURIComponent(name)}`, {
    method: "GET",
    credentials: "include",
  }).then(res => res.json());
}
