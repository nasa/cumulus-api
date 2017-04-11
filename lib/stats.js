'use strict';

import { parseConfig } from 'sulu/src/common';
import { SQS, ECS, CloudWatch } from './aws-helpers';


export class Stats {

  static getConfig(resource) {
    try {
      return parseConfig('./config/config.yml');
    }
    catch (e) {
      // if this run inside a webpacked version (lambda version), config.yml is in
      // in the same path
      return parseConfig(`./${resource}/config.yml`);
    }
  }

  constructor(resource) {
    this.config = this.constructor.getConfig(resource);
    this.stats = {};
  }

  async queues() {
    const names = this.config.sqs.map(q => `${q.stackName}-${q.stage}-${q.name}`);
    const queueInfos = await Promise.all(names.map(name => SQS.attributes(name)));

    this.stats.queues = queueInfos.map(q => ({
      name: q.name,
      messagesAvailable: q.ApproximateNumberOfMessages,
      messagesInFlight: q.ApproximateNumberOfMessagesNotVisible
    }));
  }

  async tasks() {
    const ecs = new ECS();

    const results = await ecs.describeCluster();
    this.stats.tasks = {
      runningTasks: results.clusters[0].runningTasksCount,
      pendingTasks: results.clusters[0].pendingTasksCount
    };
  }

  async services() {
    const ecs = new ECS();

    let srvcs = await ecs.listServices();
    srvcs = srvcs.serviceArns.map(s => s.split('/')[1]);

    const results = await ecs.describeServices(srvcs);
    this.stats.services = results.services.map(s => ({
      name: s.serviceName,
      status: s.status,
      desiredCount: s.desiredCount,
      runningCount: s.runningCount,
      pendingCount: s.pendingCount
    }));
  }

  async instances() {
    const ecs = new ECS();

    const inst = await ecs.listInstances();
    const results = await ecs.describeInstances(
      inst.containerInstanceArns.map(i => i.split('/')[1])
    );

    this.stats.instances = results.containerInstances.map((i) => {
      const obj = {
        id: i.ec2InstanceId,
        status: i.status,
        runningTasks: i.runningTasksCount,
        pendingTasks: i.pendingTasksCount
      };

      i.remainingResources.forEach((r) => {
        if (r.name === 'MEMORY') {
          obj.availableMemory = r.integerValue;
        }

        if (r.name === 'CPU') {
          obj.availableCpu = r.integerValue;
        }
      });

      return obj;
    });
  }

  async s3() {
    const buckets = Object.keys(this.config.buckets).map(key => this.config.buckets[key]);
    this.stats.s3 = await Promise.all(buckets.map(b => CloudWatch.bucketSize(b)));
  }

  async get() {
    await Promise.all([
      this.queues(),
      this.services(),
      this.tasks(),
      this.instances(),
      this.s3()
    ]);

    return this.stats;
  }

}
