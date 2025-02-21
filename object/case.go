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

package object

type DiseaseCase struct {
	CaseID        string `xorm:"varchar(100) pk" json:"caseID"`
	Symptoms      string `xorm:"varchar(100)" json:"symptoms"`
	Diagnosis     string `xorm:"varchar(100)" json:"diagnostics"`
	DiagnosisDate string `xorm:"varchar(100)" json:"diagnosticDate"`
	Prescription  string `xorm:"varchar(100)" json:"prescription"`
	FollowUp      string `xorm:"varchar(100)" json:"followUp"`

	SymptomHash string `xorm:"varchar(100)" json:"symptomHash"`
	// HospitalizationHash  string              `xorm:"varchar(100)" json:"hospitalizationHash"`
	LeaveDataHash string `xorm:"varchar(100)" json:"leaveDataHash"`
	OrdersHash    string `xorm:"varchar(100)" json:"ordersHash"`
	Variation     bool   `xorm:"bool" json:"variation"`
	// ClinicalOperations   []ClinicalOperation `xorm:"varchar(256)" json:"clinicalOperations"`
	// NursingDatas         []NursingData       `xorm:"varchar(256)" json:"nursingData"`
	// MedicalOrders        []MedicalOrder      `xorm:"varchar(256)" json:"medicalOrders"`
	HISInterfaceInfo     string `xorm:"varchar(100)" json:"HISInterfaceInfo"`
	PrimaryCarePhysician string `xorm:"varchar(100)" json:"primaryCarePhysician"`
	Type                 string `xorm:"varchar(100)" json:"type"`

	Patient Patient `xorm:"varchar(100) index" json:"patient"`
	Doctor  Doctor  `xorm:"varchar(100) index" json:"doctor"`

	SpecialistAllianceID         string `xorm:"varchar(100)" json:"specialistAllianceID"`
	IntegratedCareOrganizationID string `xorm:"varchar(100)" json:"integratedCareOrganizationID"`

	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`
	UpdatedTime string `xorm:"varchar(100)" json:"updatedTime"`
	DisplayName string `xorm:"varchar(100)" json:"displayName"`
}

func GetDiseaseCaseCount(owner, field, value string) (int64, error) {
	session := GetSession(owner, -1, -1, field, value, "", "")
	return session.Count(&DiseaseCase{})
}

func GetDiseaseCases() ([]*DiseaseCase, error) {
	diseaseCases := []*DiseaseCase{}
	err := adapter.engine.Desc("created_time").Find(&diseaseCases, &DiseaseCase{})
	if err != nil {
		return diseaseCases, err
	}
	return diseaseCases, nil
}

func GetPaginationDiseaseCase(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*DiseaseCase, error) {
	diseaseCases := []*DiseaseCase{}
	session := GetSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&diseaseCases)
	if err != nil {
		return diseaseCases, err
	}

	return diseaseCases, nil
}

func GetDiseaseCase(caseID string) (*DiseaseCase, error) {
	if caseID == "" {
		return nil, nil
	}
	diseaseCase := DiseaseCase{CaseID: caseID}
	existed, err := adapter.engine.Get(&diseaseCase)
	if err != nil {
		return &diseaseCase, err
	}
	if existed {
		return &diseaseCase, nil
	} else {
		return nil, nil
	}
}

func UpdateDiseaseCase(caseID string, diseaseCase *DiseaseCase) (bool, error) {
	p, err := GetDiseaseCase(caseID)
	if err != nil {
		return false, err
	} else if p == nil {
		return false, nil
	}
	affected, err := adapter.engine.ID(caseID).AllCols().Update(diseaseCase)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func AddDiseaseCase(diseaseCase *DiseaseCase) (bool, error) {
	affected, err := adapter.engine.Insert(diseaseCase)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func DeleteDiseaseCase(diseaseCase *DiseaseCase) (bool, error) {
	affected, err := adapter.engine.Delete(diseaseCase)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}
