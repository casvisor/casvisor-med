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

// GetSharings
// @Title GetSharings
// @Tag Sharing API
// @Description get all sharings
// @Param   pageSize     query    string  true        "The size of each page"
// @Param   p     query    string  true        "The number of the page"
// @Success 200 {object} object.Sharing The Response object
// @router /get-sharings [get]
func (c *ApiController) GetSharings() {
	owner := c.Input().Get("owner")
	limit := c.Input().Get("pageSize")
	page := c.Input().Get("p")
	field := c.Input().Get("field")
	value := c.Input().Get("value")
	sortField := c.Input().Get("sortField")
	sortOrder := c.Input().Get("sortOrder")

	if limit == "" || page == "" {
		sharings, err := object.GetMaskedSharings(object.GetSharings(owner))
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		c.ResponseOk(sharings)
	} else {
		limit := util.ParseInt(limit)
		count, err := object.GetSharingCount(owner, field, value)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		paginator := pagination.SetPaginator(c.Ctx, limit, count)
		sharings, err := object.GetMaskedSharings(object.GetPaginationSharings(owner, paginator.Offset(), limit, field, value, sortField, sortOrder))
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		c.ResponseOk(sharings, paginator.Nums())
	}
}

// GetSharing
// @Title GetSharing
// @Tag Sharing API
// @Description get sharing
// @Param   id     query    string  true        "The id ( owner/name ) of the sharing"
// @Success 200 {object} object.Sharing The Response object
// @router /get-sharing [get]
func (c *ApiController) GetSharing() {
	id := c.Input().Get("id")

	sharing, err := object.GetMaskedSharing(object.GetSharing(id))
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.ResponseOk(sharing)
}

// UpdateSharing
// @Title UpdateSharing
// @Tag Sharing API
// @Description update sharing
// @Param   id     query    string  true        "The id ( owner/name ) of the sharing"
// @Param   body    body   object.Sharing  true        "The details of the sharing"
// @Success 200 {object} controllers.Response The Response object
// @router /update-sharing [post]
func (c *ApiController) UpdateSharing() {
	id := c.Input().Get("id")

	var sharing object.Sharing
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &sharing)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.UpdateSharing(id, &sharing))
	c.ServeJSON()
}

// AddSharing
// @Title AddSharing
// @Tag Sharing API
// @Description add a sharing
// @Param   body    body   object.Sharing  true        "The details of the sharing"
// @Success 200 {object} controllers.Response The Response object
// @router /add-sharing [post]
func (c *ApiController) AddSharing() {
	var sharing object.Sharing
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &sharing)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.AddSharing(&sharing))
	c.ServeJSON()
}

// DeleteSharing
// @Title DeleteSharing
// @Tag Sharing API
// @Description delete a sharing
// @Param   body    body   object.Sharing  true        "The details of the sharing"
// @Success 200 {object} controllers.Response The Response object
// @router /delete-sharing [post]
func (c *ApiController) DeleteSharing() {
	var sharing object.Sharing
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &sharing)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.DeleteSharing(&sharing))
	c.ServeJSON()
}
