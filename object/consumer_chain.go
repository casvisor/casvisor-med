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
)

func (consumer *Consumer) runConsumerCommand() (string, error) {
	return "", nil
}

// TODO: Implement the following functions
func CommitConsumer(consumer *Consumer) (bool, error) {
	if consumer.Block != "" {
		return false, fmt.Errorf("the consumer: %s has already been committed, blockId = %s", consumer.getId(), consumer.Block)
	}

	// client, err := consumer.getConsumerChainClient()
	// if err != nil {
	// 	return false, err
	// }
	//
	// blockId, transactionId, err := client.Commit(consumer.toParam())
	// if err != nil {
	// 	return false, err
	// }
	//
	// consumer.Block = blockId
	// consumer.Transaction = transactionId
	return UpdateConsumer(consumer.getId(), consumer)
}

func QueryConsumer(id string) (string, error) {
	consumer, err := GetConsumer(id)
	if err != nil {
		return "", err
	}
	if consumer == nil {
		return "", fmt.Errorf("the consumer: %s does not exist", id)
	}

	// if consumer.Block == "" {
	// 	return "", fmt.Errorf("the consumer: %s's block ID should not be empty", consumer.getId())
	// }
	//
	// client, err := consumer.getConsumerChainClient()
	// if err != nil {
	// 	return "", err
	// }
	//
	// res, err := client.Query(consumer.Transaction, consumer.toParam())
	// if err != nil {
	// 	return "", err
	// }

	return "", nil
}
