import express from "express";

export interface User {
  id: string;
  emailAddress: string;
}

export interface Request {
  body: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
  };
}

export type Status = "updated" | "inserted" | "deleted" | "sent" | "not found" | "already exists";

export interface UserEditResponseBody {
  user: {
    id: string;
    status: Status;
    emailAddress: string;
  };
}
export interface UserGetEmailAddressResponseBody {
  user: User;
}

export interface UserEditRequest extends express.Request {
  body: {
    data: {
      user: User;
    };
  };
}
export interface NotificationRequest extends express.Request {
  body: {
    data: {
      user: {
        id: string;
      };
    };
  };
}
export interface NotificationResponseBody {
  notification: {
    recipient: string;
    emailAddress: string;
    status: Status;
  };
}
export interface UserGetEmailAddressRequest extends express.Request {
  query: {
    id: string;
  };
}
