'use strict';

var Ajv = require('ajv');
var _ = require('lodash');
var schema = require('./recipe.json');

var Builder = function (recipe) {
  // Make sure recipe is valid
  var ajv = new Ajv();
  var valid = ajv.validate(schema, recipe);
  if (!valid) {
    console.error('Recipe is invalid', ajv.errors);
    return;
  }

  this.pipelineObj = {
    failureAndRerunMode: 'CASCADE',
    resourceRole: 'DataPipelineDefaultResourceRole',
    role: 'DataPipelineDefaultRole',
    scheduleType: 'ONDEMAND',
    name: 'Default',
    id: 'Default',
    pipelineLogUri: '#{myS3LogsPath}'
  };

  this.recipe = recipe;
  this.name = recipe.name;

  if (recipe.resource === 'ec2') {
    this.ec2Resource = {
      resourceRole: 'DataPipelineDefaultResourceRole',
      role: 'DataPipelineDefaultRole',
      imageId: 'ami-e8ed7eff',
      instanceType: 't2.micro',
      name: recipe.name,
      keyPair: 'cumulus-scisco',
      securityGroupIds: ['sg-f179698a'],
      id: recipe.name,
      type: 'Ec2Resource',
      actionOnTaskFailure: 'terminate',
      actionOnResourceFailure: 'retryAll',
      maximumRetries: '1',
      associatePublicIpAddress: 'true',
      terminateAfter: '1 hours'
    };
  } else {
    this.ec2Resource = null;
  }

  this.parameters = {
    parameters: [{
      default: 's3://cumulus-ghrc-logs/files.json',
      id: 'myS3FilesList',
      type: 'String',
      description: 'S3 path to the file containing the list of data files'
    }, {
      id: 'myS3LogsPath',
      type: 'AWS::S3::ObjectKey',
      description: 'S3 folder for logs',
      default: 's3://cumulus-ghrc-logs/logs'
    }, {
      default: 'HOST',
      id: 'mySplunkHost',
      type: 'String',
      description: 'Splunk Host address'
    }, {
      default: 'USERNAME',
      id: 'mySplunkUsername',
      type: 'String',
      description: 'Splunk Username'
    }, {
      default: 'PASSWORD',
      id: 'mySplunkPassword',
      type: 'String',
      description: 'Splunk PASSWORD'
    }, {
      default: 'Collection Short Name',
      id: 'myShortName',
      type: 'String',
      description: 'The collection shortname'
    }, {
      default: 'CMRPASSWORD',
      id: 'myCmrPassword',
      type: 'String',
      description: 'Password for accesst to CMR'
    }]
  };

  this.template = this._template();
};

Builder.prototype = {
  _setDependency: function (step, dependency) {
    if (dependency) {
      step.dependsOn = {
        ref: dependency
      };
    }
    return step;
  },

  _clean: function (command) {
    return command.replace(/\n/g, ' ').replace(/\s\s/g, '');
  },

  /**
  *  Sets the resource for the step. The resource is either an EC2 instance
  *  or a worker groupo
  */
  _setResource: function (step) {
    if (this.ec2Resource) {
      step.runsOn = {
        ref: this.ec2Resource.id
      };
    } else {
      step.workerGroup = this.name;
    }

    return step;
  },

  archive: function (args) {
    var step = {
      type: 'ShellCommandActivity'
    };

    var image = '985962406024.dkr.ecr.us-east-1.amazonaws.com/cumulus-archiver:latest';

    if (args.action === 'download') {
      // if name is not set, set one
      if (!_.has(args, 'name')) {
        args.name = 'Fetch';
      }

      step.name = args.name;
      step.id = args.name;
      step.command = `
        mkdir -p /tmp/data/input/#{@pipelineId} &&
        mkdir -p /tmp/data/output/#{@pipelineId} &&
        mkdir -p /tmp/data/list &&
        aws s3 cp s3://cumulus-ghrc-logs/#{myS3FilesList} /tmp/data/list/#{myS3FilesList} &&
        aws ecr get-login --region us-east-1 | source /dev/stdin &&
        docker pull ${image} &&
        docker run
          --rm
          -v /tmp/data/input:/tmp/data/input
          -v /tmp/data/list:/tmp/data/list
          ${image} download --payload /tmp/data/list/#{myS3FilesList} --pipelineId #{@pipelineId}`;
    } else if (args.action === 'upload') {
      // if name is not set, set one
      if (!_.has(args, 'name')) {
        args.name = 'Push';
      }

      step.name = args.name;
      step.id = args.name;
      step.command = `
        aws ecr get-login --region us-east-1 | source /dev/stdin &&
        docker pull ${image} &&
        docker run
          --rm
          -v /tmp/data/output:/tmp/data/output
          -v /tmp/data/list:/tmp/data/list
          ${image} upload --payload /tmp/data/list/#{myS3FilesList} --pipelineId #{@pipelineId}`;
    }

    return step;
  },

  runner: function (args) {
    var step = {
      name: args.name,
      id: args.name,
      type: 'ShellCommandActivity',
      command: `
        aws ecr get-login --region us-east-1 | source /dev/stdin &&
        docker pull ${args.image} &&
        docker run
          --rm
          -e "SPLUNK_HOST=#{mySplunkHost}"
          -e "SPLUNK_USERNAME=#{mySplunkUsername}"
          -e "SPLUNK_PASSWORD=#{mySplunkPassword}"
          -e "SHORT_NAME=#{myShortName}"
          -v /tmp/data:/tmp/data
          ${args.image} /tmp/data/input/#{@pipelineId} /tmp/data/output/#{@pipelineId}`
    };

    return step;
  },

  metadata: function (args) {
    var image = '985962406024.dkr.ecr.us-east-1.amazonaws.com/docker-metadata-push:latest';

    // if name is not set, set one
    if (!_.has(args, 'name')) {
      args.name = 'Metadata';
    }

    var step = {
      name: args.name,
      id: args.name,
      type: 'ShellCommandActivity',
      command: `
        aws ecr get-login --region us-east-1 | source /dev/stdin &&
        docker pull ${image} &&
        docker run
          --rm
          -e "CMR_PROVIDER=CUMULUS"
          -e "CMR_USERNAME=devseed"
          -e "CMR_PASSWORD=#{myCmrPassword}"
          -e "CMR_CLIENT_ID=Cumulus"
          -v /tmp/data/output:/tmp/data/output
          ${image} /tmp/data/output/#{@pipelineId}`
    };

    return step;
  },

  cleanup: function (args) {
    // if name is not set, set one
    if (!_.has(args, 'name')) {
      args.name = 'CleanUp';
    }

    var step = {
      name: args.name,
      id: args.name,
      type: 'ShellCommandActivity',
      command: `
        rm -rf /tmp/data/list/#{myS3FilesList} &&
        rm -rf /tmp/data/input/#{@pipelineId} &&
        rm -rf /tmp/data/output/#{@pipelineId}`
    };

    return step;
  },

  _template: function () {
    var self = this;

    var template = {
      objects: [
        this.pipelineObj
      ]
    };

    self.recipe.steps.map(function (step) {
      var obj = self[step.type](step);
      obj.command = self._clean(obj.command);
      obj = self._setDependency(obj, _.get(step, 'after', null));
      obj = self._setResource(obj);

      template.objects.push(obj);
    });

    return template;
  }
};

module.exports = Builder;
