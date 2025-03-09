const notifications: {
  id: number;
  message: string;
  type: string;
  source: string;
}[] = [];

class NotificationWorker {
  private idCounter = 0;
  private listeners: (() => void)[] = [];

  addNotification(
    message: string,
    type: string = "info",
    source: string
  ): number {
    const id = this.idCounter++;
    notifications.push({ id, message, type, source });
    this.notifyListeners();
    return id;
  }

  removeNotification(id: number): void {
    const index = notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifications.splice(index, 1);
      this.notifyListeners();
    }
  }

  getNotifications(): {
    id: number;
    message: string;
    type: string;
    source: string;
  }[] {
    return [...notifications];
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
  }

  unsubscribe(listener: () => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  clearNotifications() {
    notifications.length = 0;
    this.notifyListeners();
  }
}

export const notificationWorker = new NotificationWorker();
