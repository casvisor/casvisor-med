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

import i18next from "i18next";
import React from "react";
import * as Setting from "../Setting";
import GridCards from "./GridCards";

const ShortcutsPage = () => {
  const items = [
    {link: "/consultations", image: "/organizations", name: i18next.t("general:Consultations"), description: "医院会诊管理"},
    {link: "/learnings", image: "/users", name: i18next.t("general:Learnings"), description: "机器学习、深度学习等AI任务管理"},
    {link: "/pathscompare", image: "/providers", name: i18next.t("pathsCompare:Compare Paths"), description: "临床路径对比、监管"},
    {link: "/records", image: "/applications", name: i18next.t("general:Records"), description: "操作日志上链、查询管理"},
  ];

  const getItems = () => {
    return items.map(item => {
      item.logo = `${Setting.StaticBaseUrl}/img${item.image}.png`;
      item.createdTime = "";
      return item;
    });
  };

  return (
    <div style={{display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center"}}>
      <GridCards items={getItems()} />
    </div>
  );
};

export default ShortcutsPage;
