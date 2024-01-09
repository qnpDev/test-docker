export class OutOfMove extends Error {
  code = 40;
  constructor(message: string) {
    super();
    this.message = message;
    this.name = "OutOfMove";
  }
}

export class DuplicateComment extends Error {
  code = 41;
  constructor(message?: string) {
    super();
    this.message = message ? message : "duplicate comment";
    this.name = "DuplicateComment";
  }
}

export class CustomerGetPointNotFound extends Error {
  code = 42;
  constructor() {
    super();
    this.message = "customer not found";
    this.name = "CustomerGetPointNotFound";
  }
}

export class CustomerGetPointNotProvidePhone extends Error {
  code = 43;
  constructor() {
    super();
    this.message = "phone number not provided";
    this.name = "CustomerGetPointNotProvidePhone";
  }
}

export class DetailPointNotFound extends Error {
  code = 44;
  constructor() {
    super();
    this.message = "detail accumulate not found";
    this.name = "DetailPointNotFound";
  }
}
