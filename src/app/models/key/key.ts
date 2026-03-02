export class Key {
  id: string;
  code: string;
  name: string;

  constructor(data: Key) {
    this.id = data.id;
    this.code = data.code;
    this.name = data.name;
  }
}
