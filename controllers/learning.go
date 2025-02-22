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

	"github.com/beego/beego/utils/pagination"
	"github.com/casvisor/casvisor/object"
	"github.com/casvisor/casvisor/util"
)

// GetLearnings
// @Title GetLearnings
// @Tag Learning API
// @Description get all learnings
// @Param   pageSize     query    string  true        "The size of each page"
// @Param   p     query    string  true        "The number of the page"
// @Success 200 {object} object.Learning The Response object
// @router /get-learnings [get]
func (c *ApiController) GetLearnings() {
	owner := c.Input().Get("owner")
	limit := c.Input().Get("pageSize")
	page := c.Input().Get("p")
	field := c.Input().Get("field")
	value := c.Input().Get("value")
	sortField := c.Input().Get("sortField")
	sortOrder := c.Input().Get("sortOrder")

	if limit == "" || page == "" {
		learnings, err := object.GetMaskedLearnings(object.GetLearnings(owner))
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		c.ResponseOk(learnings)
	} else {
		limit := util.ParseInt(limit)
		count, err := object.GetLearningCount(owner, field, value)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		paginator := pagination.SetPaginator(c.Ctx, limit, count)
		learnings, err := object.GetMaskedLearnings(object.GetPaginationLearnings(owner, paginator.Offset(), limit, field, value, sortField, sortOrder))
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		c.ResponseOk(learnings, paginator.Nums())
	}
}

// GetLearning
// @Title GetLearning
// @Tag Learning API
// @Description get learning
// @Param   id     query    string  true        "The id ( owner/name ) of the learning"
// @Success 200 {object} object.Learning The Response object
// @router /get-learning [get]
func (c *ApiController) GetLearning() {
	id := c.Input().Get("id")

	learning, err := object.GetMaskedLearning(object.GetLearning(id))
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.ResponseOk(learning)
}

// UpdateLearning
// @Title UpdateLearning
// @Tag Learning API
// @Description update learning
// @Param   id     query    string  true        "The id ( owner/name ) of the learning"
// @Param   body    body   object.Learning  true        "The details of the learning"
// @Success 200 {object} controllers.Response The Response object
// @router /update-learning [post]
func (c *ApiController) UpdateLearning() {
	id := c.Input().Get("id")

	var learning object.Learning
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &learning)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.UpdateLearning(id, &learning))
	c.ServeJSON()
}

// AddLearning
// @Title AddLearning
// @Tag Learning API
// @Description add a learning
// @Param   body    body   object.Learning  true        "The details of the learning"
// @Success 200 {object} controllers.Response The Response object
// @router /add-learning [post]
func (c *ApiController) AddLearning() {
	var learning object.Learning
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &learning)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.AddLearning(&learning))
	c.ServeJSON()
}

// DeleteLearning
// @Title DeleteLearning
// @Tag Learning API
// @Description delete a learning
// @Param   body    body   object.Learning  true        "The details of the learning"
// @Success 200 {object} controllers.Response The Response object
// @router /delete-learning [post]
func (c *ApiController) DeleteLearning() {
	var learning object.Learning
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &learning)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.DeleteLearning(&learning))
	c.ServeJSON()
}
