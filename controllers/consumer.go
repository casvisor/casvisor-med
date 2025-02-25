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

// GetConsumers
// @Title GetConsumers
// @Tag Consumer API
// @Description get all consumers
// @Param   pageSize     query    string  true        "The size of each page"
// @Param   p     query    string  true        "The number of the page"
// @Success 200 {object} object.Consumer The Response object
// @router /get-consumers [get]
func (c *ApiController) GetConsumers() {
	owner := c.Input().Get("owner")
	limit := c.Input().Get("pageSize")
	page := c.Input().Get("p")
	field := c.Input().Get("field")
	value := c.Input().Get("value")
	sortField := c.Input().Get("sortField")
	sortOrder := c.Input().Get("sortOrder")

	if limit == "" || page == "" {
		consumers, err := object.GetMaskedConsumers(object.GetConsumers(owner))
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		c.ResponseOk(consumers)
	} else {
		limit := util.ParseInt(limit)
		count, err := object.GetConsumerCount(owner, field, value)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		paginator := pagination.SetPaginator(c.Ctx, limit, count)
		consumers, err := object.GetMaskedConsumers(object.GetPaginationConsumers(owner, paginator.Offset(), limit, field, value, sortField, sortOrder))
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		c.ResponseOk(consumers, paginator.Nums())
	}
}

// GetConsumer
// @Title GetConsumer
// @Tag Consumer API
// @Description get consumer
// @Param   id     query    string  true        "The id ( owner/name ) of the consumer"
// @Success 200 {object} object.Consumer The Response object
// @router /get-consumer [get]
func (c *ApiController) GetConsumer() {
	id := c.Input().Get("id")

	consumer, err := object.GetMaskedConsumer(object.GetConsumer(id))
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.ResponseOk(consumer)
}

// UpdateConsumer
// @Title UpdateConsumer
// @Tag Consumer API
// @Description update consumer
// @Param   id     query    string  true        "The id ( owner/name ) of the consumer"
// @Param   body    body   object.Consumer  true        "The details of the consumer"
// @Success 200 {object} controllers.Response The Response object
// @router /update-consumer [post]
func (c *ApiController) UpdateConsumer() {
	id := c.Input().Get("id")

	var consumer object.Consumer
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &consumer)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.UpdateConsumer(id, &consumer))
	c.ServeJSON()
}

// AddConsumer
// @Title AddConsumer
// @Tag Consumer API
// @Description add a consumer
// @Param   body    body   object.Consumer  true        "The details of the consumer"
// @Success 200 {object} controllers.Response The Response object
// @router /add-consumer [post]
func (c *ApiController) AddConsumer() {
	var consumer object.Consumer
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &consumer)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.AddConsumer(&consumer))
	c.ServeJSON()
}

// DeleteConsumer
// @Title DeleteConsumer
// @Tag Consumer API
// @Description delete a consumer
// @Param   body    body   object.Consumer  true        "The details of the consumer"
// @Success 200 {object} controllers.Response The Response object
// @router /delete-consumer [post]
func (c *ApiController) DeleteConsumer() {
	var consumer object.Consumer
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &consumer)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.DeleteConsumer(&consumer))
	c.ServeJSON()
}
