import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { OperationType } from "../../entities/Statement";
import { GetStatementOperationError } from "./GetStatementOperationError";


let getStatementOperationUseCase: GetStatementOperationUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to show a statement operation by user id", async () => {
    const user: ICreateUserDTO = {
      name: "user teste",
      email: "userteste@mail.com",
      password: "123"
    };

    const userCreated = await inMemoryUsersRepository.create(user);

    const deposit = {
      type: OperationType.DEPOSIT, amount: 10000, description: "Desenvolvimento de uma aplicação"
    };

    const statementDepositCreated = await inMemoryStatementsRepository.create({
      user_id: userCreated.id as string,
      type: deposit.type,
      amount: deposit.amount,
      description: deposit.description
    });

    const response = await getStatementOperationUseCase.execute({
      user_id: userCreated.id as string,
      statement_id: statementDepositCreated.id as string
    })

    expect(response).toHaveProperty("id")
    expect(response).toHaveProperty("type")

  });

  it("should not be able to show a statement operation with nonexistent user", () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({ user_id: "1234", statement_id: "123456" })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to show a statement operation with nonexistent statement", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "user teste",
        email: "userteste@mail.com",
        password: "123"
      };

      const userCreated = await inMemoryUsersRepository.create(user);

      await getStatementOperationUseCase.execute({ user_id: userCreated.id as string, statement_id: "123456" })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});