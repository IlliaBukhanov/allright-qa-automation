import type { TLoginCase } from "../../type/TLoginCase";
import { standardUser } from "../dict/users";

export const invalidLoginCases: TLoginCase[] = [
  {
    name: "Incorrect username",
    testData: { username: "wrong_user", password: standardUser.password },
    expectedData: { error: "Epic sadface: Username and password do not match any user in this service" },
  },
  {
    name: "Incorrect password",
    testData: { username: standardUser.username, password: "wrong_password" },
    expectedData: { error: "Epic sadface: Username and password do not match any user in this service" },
  },
  {
    name: "Empty username",
    testData: { username: "", password: standardUser.password },
    expectedData: { error: "Epic sadface: Username is required" },
  },
  {
    name: "Empty password",
    testData: { username: standardUser.username, password: "" },
    expectedData: { error: "Epic sadface: Password is required" },
  },
  {
    name: "Empty username and password",
    testData: { username: "", password: "" },
    expectedData: { error: "Epic sadface: Username is required" },
  },
];
