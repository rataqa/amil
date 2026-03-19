// TODO: implement AMQP message publisher

import { Options } from 'amqplib';
import { ChannelWrapper } from 'amqp-connection-manager';

export class MessagePublisher {

  constructor(protected channel: ChannelWrapper) {
    // do nothing
  }

  async sendToQueue(queue: string, content: Buffer, options?: Options.Publish) {
    return this.channel.sendToQueue(queue, content, options);
  }

  async publishToExchange(x: string, routingKey: string, content: Buffer, options?: Options.Publish) {
    return this.channel.publish(x, routingKey, content, options);
  }
}
