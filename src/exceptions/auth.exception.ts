export class WrongToken extends Error {
  code = -40;
  constructor() {
    super();
    this.message = "Wrong token";
    this.name = "WrongToken";
  }
}
