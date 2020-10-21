## List workflows

List workflows in the Cumulus system.

```endpoint
GET /workflows
```

#### Example request

```curl
$ curl https://example.com/workflows --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
[
    {
        "name": "TestLambdaVersionWorkflow",
        "template": "s3://cumulus-test-sandbox-internal/cumulus/workflows/TestLambdaVersionWorkflow.json",
        "definition": {
            "Comment": "Tests Lambda update after redeploy",
            "StartAt": "StartStatus",
            "States": {
                "StartStatus": {
                    "Type": "Task",
                    "Resource": "${SfSnsReportLambdaAliasOutput}",
                    "Next": "WaitForDeployment"
                },
                "WaitForDeployment": {
                    "Type": "Task",
                    "Resource": "${WaitForDeploymentLambdaAliasOutput}",
                    "Next": "VersionUpTest"
                },
                "VersionUpTest": {
                    "Type": "Task",
                    "Resource": "${VersionUpTestLambdaAliasOutput}",
                    "Next": "StopStatus"
                },
                "StopStatus": {
                    "Type": "Task",
                    "Resource": "${SfSnsReportLambdaAliasOutput}",
                    "Catch": [
                        {
                            "ErrorEquals": [
                                "States.ALL"
                            ],
                            "Next": "WorkflowFailed"
                        }
                    ],
                    "End": true
                },
                "WorkflowFailed": {
                    "Type": "Fail",
                    "Cause": "Workflow failed"
                }
            }
        }
    },
    {
        "name": "HelloWorldWorkflow",
        "template": "s3://cumulus-test-sandbox-internal/cumulus/workflows/HelloWorldWorkflow.json",
        "definition": {
            "Comment": "Returns Hello World",
            "StartAt": "StartStatus",
            "States": {
                "StartStatus": {
                    "Type": "Task",
                    "Resource": "${SfSnsReportLambdaAliasOutput}",
                    "Next": "HelloWorld"
                },
                "HelloWorld": {
                    "Type": "Task",
                    "Resource": "${HelloWorldLambdaAliasOutput}",
                    "Next": "StopStatus"
                },
                "StopStatus": {
                    "Type": "Task",
                    "Resource": "${SfSnsReportLambdaAliasOutput}",
                    "Catch": [
                        {
                            "ErrorEquals": [
                                "States.ALL"
                            ],
                            "Next": "WorkflowFailed"
                        }
                    ],
                    "End": true
                },
                "WorkflowFailed": {
                    "Type": "Fail",
                    "Cause": "Workflow failed"
                }
            }
        }
    }
]
```

## Retrieve workflow

Retrieve a single workflow.

```endpoint
GET /workflow/{name}
```

#### Example request

```curl
$ curl https://example.com/workflows/HelloWorldWorkflow --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "name": "HelloWorldWorkflow",
    "template": "s3://cumulus-test-sandbox-internal/cumulus/workflows/HelloWorldWorkflow.json",
    "definition": {
        "Comment": "Returns Hello World",
        "StartAt": "StartStatus",
        "States": {
            "StartStatus": {
                "Type": "Task",
                "Resource": "${SfSnsReportLambdaAliasOutput}",
                "Next": "HelloWorld"
            },
            "HelloWorld": {
                "Type": "Task",
                "Resource": "${HelloWorldLambdaAliasOutput}",
                "Next": "StopStatus"
            },
            "StopStatus": {
                "Type": "Task",
                "Resource": "${SfSnsReportLambdaAliasOutput}",
                "Catch": [
                    {
                        "ErrorEquals": [
                            "States.ALL"
                        ],
                        "Next": "WorkflowFailed"
                    }
                ],
                "End": true
            },
            "WorkflowFailed": {
                "Type": "Fail",
                "Cause": "Workflow failed"
            }
        }
    }
}
```
