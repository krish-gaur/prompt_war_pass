type Listener = (message: string) => void;

let listener: Listener | null = null;

export function onNotify(l: Listener | null): void {
  listener = l;
}

export function notify(message: string): void {
  listener?.(message);
}
