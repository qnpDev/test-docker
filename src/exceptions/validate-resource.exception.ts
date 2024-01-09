export class WrongValidate extends Error {
  code = -1;
  constructor(message: string) {
    super(message);
  }
}
