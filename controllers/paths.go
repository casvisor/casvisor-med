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
	"io/ioutil"

	//"github.com/beego/beego/utils/pagination"
	"github.com/casvisor/casvisor/object"
	//"github.com/casvisor/casvisor/util"
)

// GetBpmns
// @Title GetBpmns
// @Tag Bpmn API
// @Description get all bpmns
// @Param   pageSize     query    string  true        "The size of each page"
// @Param   p     query    string  true        "The number of the page"
// @Success 200 {object} object.Bpmn The Response object
// @router /get-bpmns [get]
func (c *ApiController) GetBpmns() {
	//owner := c.Input().Get("owner")
	//limit := c.Input().Get("pageSize")
	//page := c.Input().Get("p")
	//
	//if limit == "" || page == "" {
	//	bpmns, err := object.GetMaskedBpmns(object.GetBpmns(owner))
	//	if err != nil {
	//		c.ResponseError(err.Error())
	//		return
	//	}
	//
	//	c.ResponseOk(bpmns)
	//} else {
	//	limit := util.ParseInt(limit)
	//	count, err := object.GetBpmnCount(owner, field, value)
	//	if err != nil {
	//		c.ResponseError(err.Error())
	//		return
	//	}
	//
	//	paginator := pagination.SetPaginator(c.Ctx, limit, count)
	//	bpmns, err := object.GetMaskedBpmns(object.GetPaginationBpmns(owner, paginator.Offset(), limit, field, value, sortField, sortOrder))
	//	if err != nil {
	//		c.ResponseError(err.Error())
	//		return
	//	}
	//	c.ResponseOk(bpmns, paginator.Nums())
	//}
	c.ResponseOk()
}

// GetBpmn
// @Title GetBpmn
// @Tag Bpmn API
// @Description compare two BPMN files
// @Param   standardBpmn     formData    file  true        "The standard BPMN file"
// @Param   unknownBpmn      formData    file  true        "The unknown BPMN file"
// @Success 200 {object} object.Bpmn The Response object
// @router /compare-bpmn [post]
func (c *ApiController) CompareBpmn() {
	// **获取上传的标准 BPMN 文件**
	standardFile, _, err := c.Ctx.Request.FormFile("standardBpmn")
	if err != nil {
		c.ResponseError("Failed to get standard BPMN file: " + err.Error())
		return
	}
	defer standardFile.Close()
	standardFileBytes, _ := ioutil.ReadAll(standardFile)

	// **获取上传的未知 BPMN 文件**
	unknownFile, _, err := c.Ctx.Request.FormFile("unknownBpmn")
	if err != nil {
		c.ResponseError("Failed to get unknown BPMN file: " + err.Error())
		return
	}
	defer unknownFile.Close()
	unknownFileBytes, _ := ioutil.ReadAll(unknownFile)

	// **调用 GetBpmn 进行比对**
	comparisonResult, _ := object.GetBpmn(standardFileBytes, unknownFileBytes)

	// **返回比对结果**
	c.ResponseOk(map[string]interface{}{
		//"bpmn":   bpmn,
		"result": comparisonResult,
	})
}

// UpdateBpmn
// @Title UpdateBpmn
// @Tag Bpmn API
// @Description update bpmn
// @Param   id     query    string  true        "The id ( owner/name ) of the bpmn"
// @Param   body    body   object.Bpmn  true        "The details of the bpmn"
// @Success 200 {object} controllers.Response The Response object
// @router /update-bpmn [post]
func (c *ApiController) UpdateBpmn() {
	id := c.Input().Get("id")

	var bpmn object.Bpmn
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &bpmn)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.UpdateBpmn(id, &bpmn))
	c.ServeJSON()
}

// AddBpmn
// @Title AddBpmn
// @Tag Bpmn API
// @Description add a bpmn
// @Param   body    body   object.Bpmn  true        "The details of the bpmn"
// @Success 200 {object} controllers.Response The Response object
// @router /add-bpmn [post]
func (c *ApiController) AddBpmn() {
	var bpmn object.Bpmn
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &bpmn)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.AddBpmn(&bpmn))
	c.ServeJSON()
}

// DeleteBpmn
// @Title DeleteBpmn
// @Tag Bpmn API
// @Description delete a bpmn
// @Param   body    body   object.Bpmn  true        "The details of the bpmn"
// @Success 200 {object} controllers.Response The Response object
// @router /delete-bpmn [post]
func (c *ApiController) DeleteBpmn() {
	var bpmn object.Bpmn
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &bpmn)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.DeleteBpmn(&bpmn))
	c.ServeJSON()
}
