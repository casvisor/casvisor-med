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
	"math/rand"
	"time"

	"github.com/beego/beego/utils/pagination"
	"github.com/casvisor/casvisor/object"
	"github.com/casvisor/casvisor/util"
)

// GetRecords
// @Title GetRecords
// @Tag Record API
// @Description get all records
// @Param   pageSize     query    string  true        "The size of each page"
// @Param   p     query    string  true        "The number of the page"
// @Success 200 {object} object.Record The Response object
// @router /get-records [get]
func (c *ApiController) GetRecords() {
	owner := c.Input().Get("owner")
	limit := c.Input().Get("pageSize")
	page := c.Input().Get("p")
	field := c.Input().Get("field")
	value := c.Input().Get("value")
	sortField := c.Input().Get("sortField")
	sortOrder := c.Input().Get("sortOrder")

	if limit == "" || page == "" {
		records, err := object.GetRecords(owner)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		c.ResponseOk(records)
	} else {
		limit := util.ParseInt(limit)

		count, err := object.GetRecordCount(owner, field, value)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		paginator := pagination.SetPaginator(c.Ctx, limit, count)
		records, err := object.GetPaginationRecords(owner, paginator.Offset(), limit, field, value, sortField, sortOrder)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		c.ResponseOk(records, paginator.Nums())
	}
}

// GetRecord
// @Title GetRecord
// @Tag Record API
// @Description get record
// @Param   id     query    string  true        "The id ( owner/name ) of the record"
// @Success 200 {object} object.Record The Response object
// @router /get-record [get]
func (c *ApiController) GetRecord() {
	id := c.Input().Get("id")

	record, err := object.GetRecord(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.ResponseOk(record)
}

// UpdateRecord
// @Title UpdateRecord
// @Tag Record API
// @Description update record
// @Param   id     query    string  true        "The id ( owner/name ) of the record"
// @Param   body    body   object.Record  true        "The details of the record"
// @Success 200 {object} controllers.Response The Response object
// @router /update-record [post]
func (c *ApiController) UpdateRecord() {
	id := c.Input().Get("id")

	var record object.Record
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &record)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.UpdateRecord(id, &record))
	c.ServeJSON()
}

// AddRecord
// @Title AddRecord
// @Tag Record API
// @Description add a record
// @Param   body    body   object.Record  true        "The details of the record"
// @Success 200 {object} controllers.Response The Response object
// @router /add-record [post]
func (c *ApiController) AddRecord() {
	var record object.Record
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &record)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	if record.ClientIp == "" {
		record.ClientIp = c.getClientIp()
	}
	if record.UserAgent == "" {
		record.UserAgent = c.getUserAgent()
	}

	_, err = handleRequestUri(record)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.AddRecord(&record))
	c.ServeJSON()
}

func handleRequestUri(record object.Record) (bool, error) {
	requestUri := record.RequestUri

	switch requestUri {
	case "/api/add-learning":
		var jsonData map[string]interface{}

		err := json.Unmarshal([]byte(record.Object), &jsonData)
		if err != nil {
			return false, err
		}

		name := getJsonData("name", jsonData)
		if name == "" {
			name = "learning_" + generateRandomString(6)
		}

		newLearning := object.Learning{
			Owner:          record.Owner,
			Name:           name,
			CreatedTime:    record.CreatedTime,
			UpdatedTime:    record.CreatedTime,
			DisplayName:    name,
			Discription:    getJsonData("discription", jsonData),
			Epoch:          getJsonData("epoch", jsonData),
			ModelPath:      getJsonData("modelPath", jsonData),
			HospitalName:   getJsonData("hospitalName", jsonData),
			LocalBatchSize: getJsonData("localBatchSize", jsonData),
			LocalEpochs:    getJsonData("localEpochs", jsonData),
		}

		affected, err := object.AddLearning(&newLearning)
		// if affected {
		// 	println("------------------> AddLearning success")
		// } else {
		// 	println("------------------> AddLearning failed")
		// }
		return affected, err

	default:
		return false, nil
	}
}

func getJsonData(key string, jsonData map[string]interface{}) string {

	if data, ok := jsonData[key]; ok {
		return data.(string)
	} else {
		return ""
	}
}

func generateRandomString(length int) string {
	const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	result := make([]byte, length)
	rand.Seed(time.Now().UnixNano()) // 使用当前时间作为随机数种子

	for i := range result {
		result[i] = letterBytes[rand.Intn(len(letterBytes))]
	}
	return string(result)
}

// DeleteRecord
// @Title DeleteRecord
// @Tag Record API
// @Description delete a record
// @Param   body    body   object.Record  true        "The details of the record"
// @Success 200 {object} controllers.Response The Response object
// @router /delete-record [post]
func (c *ApiController) DeleteRecord() {
	var record object.Record
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &record)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.DeleteRecord(&record))
	c.ServeJSON()
}
