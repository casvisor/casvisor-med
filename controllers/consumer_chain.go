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

// CommitConsumer
// @Title CommitConsumer
// @Tag Consumer API
// @Description commit a consumer
// @Param   body    body   object.Consumer  true        "The details of the consumer"
// @Success 200 {object} controllers.Response The Response object
// @router /commit-consumer [post]
func (c *ApiController) CommitConsumer() {
	var consumer object.Consumer
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &consumer)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.CommitConsumer(&consumer))
	c.ServeJSON()
}

// QueryConsumer
// @Title QueryConsumer
// @Tag Consumer API
// @Description query consumer
// @Param   id     query    string  true        "The id ( owner/name ) of the consumer"
// @Success 200 {object} object.Consumer The Response object
// @router /query-consumer [get]
func (c *ApiController) QueryConsumer() {
	id := c.Input().Get("id")

	res, err := object.QueryConsumer(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.ResponseOk(res)
}
