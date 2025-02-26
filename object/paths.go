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

package object

import (
	"fmt"
	"io/ioutil"
	"os"

	"github.com/casvisor/casvisor/bpmnpath"
	"github.com/casvisor/casvisor/util"
	"xorm.io/core"
)

type Bpmn struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`
	UpdatedTime string `xorm:"varchar(100)" json:"updatedTime"`
	DisplayName string `xorm:"varchar(100)" json:"displayName"`
	FileContent []byte `json:"fileContent"`
}

func GetBpmnCount(owner, field, value string) (int64, error) {
	session := GetSession(owner, -1, -1, field, value, "", "")
	return session.Count(&Bpmn{})
}

func GetBpmns(owner string) ([]*Bpmn, error) {
	bpmns := []*Bpmn{}
	err := adapter.engine.Desc("created_time").Find(&bpmns, &Bpmn{Owner: owner})
	if err != nil {
		return bpmns, err
	}

	return bpmns, nil
}

func GetPaginationBpmns(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*Bpmn, error) {
	bpmns := []*Bpmn{}
	session := GetSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&bpmns)
	if err != nil {
		return bpmns, err
	}

	return bpmns, nil
}

func GetBpmn(standardContent []byte, unknownContent []byte) (string, error) {
	// **检查是否为空**
	if len(standardContent) == 0 || len(unknownContent) == 0 {
		return "", fmt.Errorf("both standard and unknown BPMN files must be provided")
	}

	// **创建临时文件存储标准 BPMN**
	standardFile, err := ioutil.TempFile("", "standard_bpmn_*.bpmn")
	if err != nil {
		return "", fmt.Errorf("failed to create standard BPMN temp file: %v", err)
	}
	defer os.Remove(standardFile.Name()) // **函数执行完毕后删除临时文件**

	if _, err := standardFile.Write(standardContent); err != nil {
		standardFile.Close()
		return "", fmt.Errorf("failed to write standard BPMN content to temp file: %v", err)
	}
	standardFile.Close()

	// **创建临时文件存储未知 BPMN**
	unknownFile, err := ioutil.TempFile("", "unknown_bpmn_*.bpmn")
	if err != nil {
		return "", fmt.Errorf("failed to create unknown BPMN temp file: %v", err)
	}
	defer os.Remove(unknownFile.Name()) // **函数执行完毕后删除临时文件**

	if _, err := unknownFile.Write(unknownContent); err != nil {
		unknownFile.Close()
		return "", fmt.Errorf("failed to write unknown BPMN content to temp file: %v", err)
	}
	unknownFile.Close()

	// **调用 ComparePath 进行 BPMN 结构比对**
	comparisonResult := bpmnpath.ComparePath(standardFile.Name(), unknownFile.Name())

	return comparisonResult, nil
}

// func GetMaskedBpmn(bpmn *Bpmn, errs ...error) (*Bpmn, error) {
// 	if len(errs) > 0 && errs[0] != nil {
// 		return nil, errs[0]
// 	}
//
// 	if bpmn == nil {
// 		return nil, nil
// 	}
//
// 	// if bpmn.ClientSecret != "" {
// 	// 	bpmn.ClientSecret = "***"
// 	// }
// 	return bpmn, nil
// }

// func GetMaskedBpmns(bpmns []*Bpmn, errs ...error) ([]*Bpmn, error) {
// 	if len(errs) > 0 && errs[0] != nil {
// 		return nil, errs[0]
// 	}
//
// 	var err error
// 	for _, bpmn := range bpmns {
// 		bpmn, err = GetMaskedBpmn(bpmn)
// 		if err != nil {
// 			return nil, err
// 		}
// 	}
//
// 	return bpmns, nil
// }

func UpdateBpmn(id string, bpmn *Bpmn) (bool, error) {
	owner, name := util.GetOwnerAndNameFromId(id)
	p, err := getBpmn(owner, name)
	if err != nil {
		return false, err
	} else if p == nil {
		return false, nil
	}

	// if bpmn.ClientSecret == "***" {
	// 	bpmn.ClientSecret = p.ClientSecret
	// }

	affected, err := adapter.engine.ID(core.PK{owner, name}).AllCols().Update(bpmn)
	if err != nil {
		return false, err
	}

	return affected != 0, nil
}
func getBpmn(owner string, name string) (*Bpmn, error) {
	if owner == "" || name == "" {
		return nil, nil
	}

	bpmn := Bpmn{Owner: owner, Name: name}
	existed, err := adapter.engine.Get(&bpmn)
	if err != nil {
		return &bpmn, err
	}

	if existed {
		return &bpmn, nil
	} else {
		return nil, nil
	}
}
func AddBpmn(bpmn *Bpmn) (bool, error) {
	affected, err := adapter.engine.Insert(bpmn)
	if err != nil {
		return false, err
	}

	return affected != 0, nil
}

func DeleteBpmn(bpmn *Bpmn) (bool, error) {
	affected, err := adapter.engine.ID(core.PK{bpmn.Owner, bpmn.Name}).Delete(&Bpmn{})
	if err != nil {
		return false, err
	}

	return affected != 0, nil
}

func (bpmn *Bpmn) getId() string {
	return fmt.Sprintf("%s/%s", bpmn.Owner, bpmn.Name)
}
