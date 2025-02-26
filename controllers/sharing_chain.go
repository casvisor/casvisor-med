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

package controllers

import (
	"encoding/json"

	"github.com/casvisor/casvisor/object"
)

// CommitSharing
// @Title CommitSharing
// @Tag Sharing API
// @Description commit a sharing
// @Param   body    body   object.Sharing  true        "The details of the sharing"
// @Success 200 {object} controllers.Response The Response object
// @router /commit-sharing [post]
func (c *ApiController) CommitSharing() {
	var sharing object.Sharing
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &sharing)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.CommitSharing(&sharing))
	c.ServeJSON()
}

// QuerySharing
// @Title QuerySharing
// @Tag Sharing API
// @Description query sharing
// @Param   id     query    string  true        "The id ( owner/name ) of the sharing"
// @Success 200 {object} object.Sharing The Response object
// @router /query-sharing [get]
func (c *ApiController) QuerySharing() {
	id := c.Input().Get("id")

	res, err := object.QuerySharing(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.ResponseOk(res)
}
