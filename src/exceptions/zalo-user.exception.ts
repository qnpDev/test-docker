export class ZaloUserNotFound extends Error {
  code = 30;
  constructor() {
    super();
    this.message = "Zalo user not found";
    this.name = "ZaloUserNotFound";
  }
}

export class DuplicateZaloUser extends Error {
  code = 31;
  constructor() {
    super();
    this.message = "duplicate zalo user";
    this.name = "DuplicateZaloUser";
  }
}

export class UserAccountWasChanged extends Error {
  code = 32;
  constructor(message: string) {
    super(message);
    this.name = "UserAccountWasChanged";
  }
}

export class ZaloGuestNotFound extends Error {
  code = 33;
  constructor() {
    super();
    this.message = "Zalo guest not found";
    this.name = "ZaloGuestNotFound";
  }
}
