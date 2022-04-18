import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let getBalanceUseCase: GetBalanceUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  });

  it("should be able to show a balance by user id", async () => {
    const user: ICreateUserDTO = {
      name: "user teste",
      email: "userteste@mail.com",
      password: "123"
    };

    const userCreated = await inMemoryUsersRepository.create(user);

    const deposit = {
      type: OperationType.DEPOSIT, amount: 10000, description: "Desenvolvimento de uma aplicação"
    };

    await inMemoryStatementsRepository.create({
      user_id: userCreated.id as string,
      type: deposit.type,
      amount: deposit.amount,
      description: deposit.description
    });

    const withdraw = {
      type: OperationType.WITHDRAW, amount: 500, description: "Aluguel"
    };

    await inMemoryStatementsRepository.create({
      user_id: userCreated.id as string,
      type: withdraw.type,
      amount: withdraw.amount,
      description: withdraw.description
    });

    const response = await getBalanceUseCase.execute({ user_id: userCreated.id as string })

    expect(response.statement.length).toBe(2)
    expect(response.balance).toBe(9500)
  });

  it("should not be able to show a balance with nonexistent user", () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "1234" })
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});