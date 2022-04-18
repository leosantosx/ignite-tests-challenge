import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { TransferStatementError } from "./TransferStatementError";
import { TransferStatementUseCase } from "./TransferStatementUseCase";

let transferStatementUseCase: TransferStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository

describe("Tranfer Statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    transferStatementUseCase = new TransferStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to create a new statement", async () => {
    const user_sender: ICreateUserDTO = {
      name: "user teste sender",
      email: "usertestesender@mail.com",
      password: "123"
    }

    const user_receiver: ICreateUserDTO = {
      name: "user teste receiver",
      email: "usertestereceiver@mail.com",
      password: "1234"
    }

    const userSenderCreated = await inMemoryUsersRepository.create(user_sender)
    const userReceiverCreated = await inMemoryUsersRepository.create(user_receiver)

    const deposit = {
      type: OperationType.DEPOSIT, amount: 10000, description: "Desenvolvimento de uma aplicação"
    }

    await inMemoryStatementsRepository.create({
      user_id: userSenderCreated.id as string,
      type: deposit.type,
      amount: deposit.amount,
      description: deposit.description
    })

    const withdraw = {
      type: OperationType.WITHDRAW, amount: 500, description: "Aluguel"
    }

    await inMemoryStatementsRepository.create({
      user_id: userSenderCreated.id as string,
      type: withdraw.type,
      amount: withdraw.amount,
      description: withdraw.description
    })

    await transferStatementUseCase.execute({
      amount: 400,
      description: "Transferencia",
      type: OperationType.TRANSFER,
      receiver_id: userReceiverCreated.id as string,
      sender_id: userSenderCreated.id as string
    })

    const balanceUserReceiver = await inMemoryStatementsRepository.getUserBalance({ user_id: userReceiverCreated.id as string })
    const balanceUserSender = await inMemoryStatementsRepository.getUserBalance({ user_id: userSenderCreated.id as string })


    expect(balanceUserReceiver.balance).toBe(400)
    expect(balanceUserSender.balance).toBe(9100)

  });

  it("should not be able to create a new statement with nonexistent sender user", () => {
    expect(async () => {
      await transferStatementUseCase.execute({
        amount: 400,
        description: "Transferencia",
        type: OperationType.TRANSFER,
        receiver_id: "1234",
        sender_id: "12345"
      })
    }).rejects.toBeInstanceOf(TransferStatementError.UserNotFound)
  });

  it("should not be able to create a new statement with nonexistent receiver user", () => {
    expect(async () => {
      const user_sender: ICreateUserDTO = {
        name: "user teste sender",
        email: "usertestesender@mail.com",
        password: "123"
      }

      const userSenderCreated = await inMemoryUsersRepository.create(user_sender)

      await transferStatementUseCase.execute({
        amount: 400,
        description: "Transferencia",
        type: OperationType.TRANSFER,
        receiver_id: "1234",
        sender_id: userSenderCreated.id as string
      })
    }).rejects.toBeInstanceOf(TransferStatementError.UserNotFound)
  });

  it("should not be able to create a new statement with balance less than amount", () => {
    expect(async () => {
      const user_sender: ICreateUserDTO = {
        name: "user teste sender",
        email: "usertestesender@mail.com",
        password: "123"
      }

      const user_receiver: ICreateUserDTO = {
        name: "user teste receiver",
        email: "usertestereceiver@mail.com",
        password: "1234"
      }

      const userSenderCreated = await inMemoryUsersRepository.create(user_sender)
      const userReceiverCreated = await inMemoryUsersRepository.create(user_receiver)

      await transferStatementUseCase.execute({
        amount: 400,
        description: "Transferencia",
        type: OperationType.TRANSFER,
        receiver_id: userReceiverCreated.id as string,
        sender_id: userSenderCreated.id as string
      })
    }).rejects.toBeInstanceOf(TransferStatementError.InsufficientFunds)
  });

});