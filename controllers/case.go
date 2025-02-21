// Copyright 2023 The casbin Authors. All Rights Reserved.
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

// GetCases
// @Title GetCases
// @Tag Case API
// @Description get all cases
// @Param   pageSize     query    string  true        "The size of each page"
// @Param   p     query    string  true        "The number of the page"
// @Success 200 {object} object.DiseaseCase The Response object
// @router /get-cases [get]
func (c *ApiController) GetCases() {
	owner := c.Input().Get("owner")
	limit := c.Input().Get("pageSize")
	page := c.Input().Get("p")
	field := c.Input().Get("field")
	value := c.Input().Get("value")
	sortField := c.Input().Get("sortField")
	sortOrder := c.Input().Get("sortOrder")

	if limit == "" || page == "" {
		cases, err := object.GetDiseaseCases()
		if err != nil {
			c.ResponseError(err.Error())
			return
		}
		c.ResponseOk(cases)
	} else {
		limit := util.ParseInt(limit)
		count, err := object.GetDiseaseCaseCount(owner, field, value)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}
		paginator := pagination.SetPaginator(c.Ctx, limit, count)
		cases, err := object.GetPaginationDiseaseCase(owner, paginator.Offset(), limit, field, value, sortField, sortOrder)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}
		c.ResponseOk(cases, paginator.Nums())
	}
}

// GetCase
// @Title GetCase
// @Tag Case API
// @Description get case
// @Param   id     query    string  true        "The id of the case"
// @Success 200 {object} object.DiseaseCase The Response object
// @router /get-case [get]
func (c *ApiController) GetCase() {
	id := c.Input().Get("id")

	diseaseCase, err := object.GetDiseaseCase(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.ResponseOk(diseaseCase)
}

// UpdateCase
// @Title UpdateCase
// @Tag Case API
// @Description update case
// @Param   id     query    string  true        "The id of the case"
// @Param   body    body   object.DiseaseCase  true        "The details of the case"
// @Success 200 {object} controllers.Response The Response object
// @router /update-case [post]
func (c *ApiController) UpdateCase() {
	id := c.Input().Get("id")

	var diseaseCase object.DiseaseCase
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &diseaseCase)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.UpdateDiseaseCase(id, &diseaseCase))
	c.ServeJSON()
}

// AddCase
// @Title AddCase
// @Tag Case API
// @Description add a case
// @Param   body    body   object.DiseaseCase  true        "The details of the case"
// @Success 200 {object} controllers.Response The Response object
// @router /add-case [post]
func (c *ApiController) AddCase() {
	var diseaseCase object.DiseaseCase
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &diseaseCase)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.AddDiseaseCase(&diseaseCase))
	c.ServeJSON()
}

// DeleteCase
// @Title DeleteCase
// @Tag Case API
// @Description delete a case
// @Param   body    body   object.DiseaseCase  true        "The details of the case"
// @Success 200 {object} controllers.Response The Response object
// @router /delete-case [post]
func (c *ApiController) DeleteCase() {
	var diseaseCase object.DiseaseCase
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &diseaseCase)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.DeleteDiseaseCase(&diseaseCase))
	c.ServeJSON()
}
