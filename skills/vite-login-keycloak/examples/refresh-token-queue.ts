type QueuedRequest = {
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
};

export class RefreshTokenQueue {
  private isRefreshing = false;
  private queue: QueuedRequest[] = [];

  isInProgress(): boolean {
    return this.isRefreshing;
  }

  enqueue(request: QueuedRequest): void {
    this.queue.push(request);
  }

  flush(error?: unknown): void {
    for (const queuedRequest of this.queue) {
      if (error) queuedRequest.reject(error);
      else queuedRequest.resolve();
    }
    this.queue = [];
  }

  setRefreshing(value: boolean): void {
    this.isRefreshing = value;
  }
}
