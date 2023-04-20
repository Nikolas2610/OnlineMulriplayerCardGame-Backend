import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { WsException } from '@nestjs/websockets/errors';
import { GamesEntity } from 'src/entities/db/games.entity';
import { TablesEntity } from 'src/entities/db/tables.entity';
import { TableUsersEntity } from 'src/entities/db/table_users.entity';
import { UsersEntity } from 'src/entities/db/users.entity';
import { CreateTable } from 'src/table/models/create-table.dto';
import { TableStatus } from 'src/table/models/table-status.enum';
import { DeleteResult, EqualOperator, Repository, Table } from 'typeorm';
import { JoinTable } from './dto/JoinTable.dto';
import { v4 as uuidv4 } from 'uuid';
import { RolesEntity } from 'src/entities/db/roles.entity';
import { TeamsEntity } from 'src/entities/db/teams.entity';
import { StatusEntity } from 'src/entities/db/status.entity';
import { TablesDecksEntity } from 'src/entities/db/table_decks.entity';
import { TablesCardsEntity } from 'src/entities/db/table_cards.entity';
import { DecksEntity } from 'src/entities/db/decks.entity';
import { HandStartCardsEntity } from 'src/entities/db/hand_start_cards.entity';
import { TableDeckType } from 'src/table/models/table-deck-type.enum';
import * as bcrypt from 'bcrypt';
import { HandStartCardsRuleType } from 'src/game/models/relation/hand-start-cards/HandStartCardsRuleType.enum';
import { DeckType } from 'src/deck/services/models/DeckType.enum';
import { StoreRankRow } from './dto/StoreRankRow.dto';
import { RankEntity } from 'src/entities/db/ranks.entity';
import { RankType } from 'src/rank/types/rank-type.enum';

@Injectable()
export class OnlineTableService {

  constructor(
    @InjectRepository(TablesEntity)
    private readonly tablesRepository: Repository<TablesEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(GamesEntity)
    private readonly gamesRepository: Repository<GamesEntity>,
    @InjectRepository(TableUsersEntity)
    private readonly tableUsersRepository: Repository<TableUsersEntity>,
    @InjectRepository(TablesDecksEntity)
    private readonly tableDecksRepository: Repository<TablesDecksEntity>,
    @InjectRepository(TablesCardsEntity)
    private readonly tableCardsRepository: Repository<TablesCardsEntity>,
    @InjectRepository(DecksEntity)
    private readonly decksRepository: Repository<DecksEntity>,
    @InjectRepository(HandStartCardsEntity)
    private readonly handStartCardsRepository: Repository<HandStartCardsEntity>,
    @InjectRepository(RankEntity)
    private readonly rankRepository: Repository<RankEntity>,
  ) { }

  async createTable(userId: number, table: CreateTable) {
    try {
      // Queries
      const userDB = await this.usersRepository.findOne({ where: { id: userId } });
      const gameDB = await this.gamesRepository.findOne({ where: { id: table.game } });
      const tableDB = new TablesEntity();
      // Save data
      tableDB.name = table.name;
      tableDB.creator = tableDB.game_master = userDB;
      tableDB.private = table.private;
      tableDB.password = table.password ? await this.hashPassword(table.password) : null;
      tableDB.game = gameDB;
      tableDB.public_url = uuidv4();

      // return new table
      return await this.tablesRepository.save(tableDB);
    } catch (error) {
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: process.env.NODE_ENV === 'development' ? error : "Can't create game" }, HttpStatus.BAD_REQUEST);
    }
  }

  async validateTablePassword(table: TablesEntity, password: string) {
    try {
      const isValidPassword = await bcrypt.compare(password, table.password);
      if (isValidPassword) {
        return { message: 'success', status: 200 }
      } else {
        return { message: 'error', status: 400 }
      }
    } catch (error) {
      return error
    }
  }

  // Hash the password
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async removeTable(tableId: number): Promise<DeleteResult> {
    try {
      return await this.tablesRepository.delete(tableId);
    } catch (error) {
      return error
    }
  }

  async findAll() {
    return await this.tablesRepository.find(
      {
        where: [{ status: TableStatus.WAITING }, { status: TableStatus.PLAYING }],
        relations: ['game', 'creator', 'table_users', 'game_master', 'game.deck', 'game.deck.cards'],
        order: {
          created_at: 'DESC'
        }
      }
    )
  }

  async joinTable(data: JoinTable, user: UsersEntity, socketId: string) {
    try {
      // Set the the data for the table user
      const tableUsers = new TableUsersEntity();
      tableUsers.table = await this.findTable(data.tableId, data.publicUrl);
      tableUsers.user = user
      tableUsers.playing = false;
      tableUsers.socket_id = socketId;
      // Save and return the user
      if (!data.tableId) {
        return await this.tableUsersRepository.findOne({
          where: { table: new EqualOperator(tableUsers.table.id), user: new EqualOperator(user.id) }
        })
      }
      const countTableUsers = await this.tableUsersRepository.count({ where: { table: new EqualOperator(data.tableId) } });
      tableUsers.turn = countTableUsers + 1;
      return await this.tableUsersRepository.save(tableUsers);
    } catch (error) {
      return error
    }
  }

  async leaveTable(userId: number, tableId: number) {
    try {
      // Get table user
      const tableUser = await this.tableUsersRepository.findOne({
        where: { user: new EqualOperator(userId), table: new EqualOperator(tableId) },
        relations: ['table']
      });
      // Delete table user
      const response = await this.tableUsersRepository.delete(tableUser.id);
      // Update users turn
      await this.updatePlayerTurnOnLeave(tableId);
      // Return the response
      if (response.affected === 1) {
        return tableUser;
      } else {
        return response;
      }
    } catch (error) {
      return error
    }
  }

  async updatePlayerTurnOnLeave(tableId: number) {
    try {
      const users = await this.tableUsersRepository.find({ where: { table: new EqualOperator(tableId) } })
      users.forEach((user, index) => {
        user.turn = index + 1;
      })
      await this.tableUsersRepository.save(users);
    } catch (error) {
      throw new WsException("Cant't update users turn");
    }
  }

  async findTable(id: number, public_url: string): Promise<TablesEntity> {
    try {
      const table = await this.tablesRepository.findOne({
        where: {
          id, public_url
        },
      })
      if (table) {
        return table;
      }
      throw new WsException("Cant't find table with these credentials");
    } catch (error) {
      throw new WsException("Cant't find table with these credentials");
    }
  }

  async loadTableGame(id: number) {
    try {
      const table = await this.tablesRepository.findOne({
        where: {
          id
        },
        relations: ['game', 'creator', 'table_users', 'game_master', 'game.deck', 'game.deck.cards', 'table_users.user', 'table_users.role', 'table_users.team', 'table_users.status', 'game.hand_start_cards', 'game.roles', 'game.teams', 'game.status'],
      })
      if (table) {
        return table;
      }
      throw new WsException("Cant't find table with these credentials");
    } catch (error) {
      throw new WsException("Cant't find table with these credentials");
    }
  }

  async getUserById(userId: number): Promise<UsersEntity> {
    try {
      return await this.usersRepository.findOne({ where: { id: userId } });
    } catch (error) {
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: process.env.NODE_ENV === 'development' ? error : "User not exists" }, HttpStatus.BAD_REQUEST);
    }
  }

  async getTableUsers(tableId: number) {
    try {
      return await this.tableUsersRepository.find({
        where: { table: new EqualOperator(tableId) },
        relations: ['user']
      });
    } catch (error) {
      return error;
    }
  }

  async setTurnTableUsers(tableUsers: TableUsersEntity[]) {
    try {
      return await this.tableUsersRepository.save(tableUsers);
    } catch (error) {
      return error
    }
  }

  async disconnectUser(socket_id: string): Promise<TableUsersEntity | null> {
    try {
      const tableUser = await this.tableUsersRepository.findOne({
        where: { socket_id },
        relations: ['table']
      });
      if (tableUser) {
        const tableDecks = await this.tableDecksRepository.find({ where: { table: new EqualOperator(tableUser.table.id), user: null } })
        if (tableDecks.length === 1) {
          await this.eraseDecksAndCards(tableUser.table);
        } else {
          const tableDeck = await this.tableDecksRepository.findOne({ where: { table_user: new EqualOperator(tableUser.id) }, relations: ['table_cards'] });

          if (tableDeck) {
            await Promise.all(tableDeck.table_cards.map(card => {
              return this.tableCardsRepository.delete(card.id);
            }));
            await this.tableDecksRepository.delete(tableDeck.id);
          }
        }

        const response = await this.tableUsersRepository.delete(tableUser.id);
        if (response.affected === 1) {
          return tableUser;
        }


      }
      return null;
    } catch (error) {
      return error;
    }
  }

  async setStatusTableUser(tableUser: TableUsersEntity, status: StatusEntity) {
    try {
      tableUser.status = status;
      return await this.tableUsersRepository.save(tableUser);
    } catch (error) {
      return error
    }
  }

  async setTeamTableUser(tableUser: TableUsersEntity, team: TeamsEntity) {
    try {
      tableUser.team = team;
      return await this.tableUsersRepository.save(tableUser);
    } catch (error) {
      return error
    }
  }

  async setRoleTableUser(tableUser: TableUsersEntity, role: RolesEntity) {
    try {
      tableUser.role = role;
      return await this.tableUsersRepository.save(tableUser);
    } catch (error) {
      return error
    }
  }

  async startGame(table: TablesEntity) {
    try {
      const tableDB = await this.tablesRepository.findOne({ where: { id: new EqualOperator(table.id) } });
      // Set playing status to the table
      table.status = TableStatus.PLAYING;
      table.table_decks = [];
      // Create table user decks
      const createTableUserDecksPromises = table.table_users.map(async user => {
        if (!user.role) {
          const role = table.game.roles.find(r => r.name === 'Player');
          if (role) {
            user.role = role;
            await this.tableUsersRepository.save(user)
          }
        }
        const tableDeck = new TablesDecksEntity();
        tableDeck.user = user.user;
        tableDeck.table = tableDB;
        tableDeck.table_user = user;
        return await this.tableDecksRepository.save(tableDeck);
      });
      const tableUserDecks = await Promise.all(createTableUserDecksPromises);
      table.table_decks.push(...tableUserDecks);
      // Create table decks for the decks and extra decks
      const createTableDecksPromises = table.game.deck.map(async deck => {

        const tableDeck = new TablesDecksEntity();
        tableDeck.deck = deck;
        // Determine the type of the table deck based on the deck's type and name
        let type = TableDeckType.DECK;
        if (deck.type !== DeckType.DECK) {
          const deckName = deck.name.toLowerCase();
          if (deckName === TableDeckType.TABLE) {
            type = TableDeckType.TABLE;
          }
          else if (deckName === TableDeckType.JUNK) {
            type = TableDeckType.JUNK;
          }
        }
        tableDeck.type = type;
        tableDeck.table = tableDB;
        return await this.tableDecksRepository.save(tableDeck);
      });
      const tableDecks = await Promise.all(createTableDecksPromises);
      table.table_decks.push(...tableDecks);
      // Update the table
      return await this.tablesRepository.save(table);
    } catch (error) {
      return error
    }
  }

  async createTableCards(table: TablesEntity) {
    try {
      const tableDecks: number[] = [];
      const promises = table.table_decks.map(async (deck) => {
        if (deck.deck?.type === DeckType.DECK) {
          tableDecks.push(deck.id);
          const deckDB = await this.decksRepository.findOne({ where: { id: new EqualOperator(deck.deck.id) }, relations: ['cards'] })
          return Promise.all(deckDB.cards.map(async (card, index) => {
            const tableCard = new TablesCardsEntity();
            tableCard.turn = index;
            tableCard.table_deck = deck;
            tableCard.card = card;
            return await this.tableCardsRepository.save(tableCard);
          }));
        } else {
          return null;
        }
      });

      const results = await Promise.all(promises);
      const cardsDB = results.flat().filter((card) => card !== null);
      const shuffleCards = await this.shuffleCards(cardsDB, tableDecks);

      const cards = await this.setStartCards(table, shuffleCards);

      return cards;
    } catch (error) {
      return error;
    }
  }

  async shuffleCards(cards: TablesCardsEntity[], tableDecks: number[]): Promise<TablesCardsEntity[]> {
    const shuffledCards: TablesCardsEntity[] = [];
    for (const deckId of tableDecks) {
      const deck = cards.filter(card => card.table_deck.id === deckId);
      // Fisher-Yates shuffle algorithm
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      deck.forEach((card, index) => {
        card.turn = index;
        shuffledCards.push(card);
      });
    }
    return this.tableCardsRepository.save(shuffledCards);
  }

  async setStartCards(table: TablesEntity, cards: TablesCardsEntity[]) {
    try {
      // Set start cards for hand start cards with type role
      const handStartCardsRolesRules = await this.handStartCardsRepository.find({
        where: { game: new EqualOperator(table.game.id), type: HandStartCardsRuleType.ROLE },
        relations: ['role', 'deck'],
      });
      const tableDecks = await this.tableDecksRepository.find({
        where: { table: new EqualOperator(table.id) },
        relations: ['deck', 'user', 'table_user', 'table_user.role', 'table']
      });
      // Set start cards for user decks
      for (const deck of tableDecks) {
        let width = 0;
        let height = 0;
        if (deck.type.toLowerCase() === TableDeckType.USER) {
          const rules = handStartCardsRolesRules.filter(rule => rule.role.id === deck.table_user?.role?.id);
          if (rules) {
            for (const rule of rules) {
              const ruleTableDeck = tableDecks.find(d => d.deck?.id === rule.deck.id);
              const countCards = rule.count_cards;
              let addCards = 0;
              for (const card of cards) {
                if (card.table_deck.id === ruleTableDeck.id) {
                  card.position_x = height;
                  card.position_y = width;
                  card.table_deck = deck;
                  card.hidden = rule.hidden;
                  addCards++;
                  // Print the cards in a row in the player deck
                  width = width + 50;
                  if (width >= 800) {
                    width = 0;
                    height = height + 75;
                  }
                }
                if (addCards >= countCards) {
                  break;
                }
              }
            }
          }
        }
      }

      // Set start cards for hand start cards with type deck
      const handStartCardsDeckRules = await this.handStartCardsRepository.find({
        where: { game: new EqualOperator(table.game.id), type: HandStartCardsRuleType.DECK },
        relations: ['role', 'deck', 'toDeck'],
      });
      if (handStartCardsDeckRules) {
        let width = 0;
        let height = 0;
        await Promise.all(handStartCardsDeckRules.map(async rule => {
          const fromTableDeck = tableDecks.find(d => d.deck?.id === rule.deck?.id);
          const toTableDeck = tableDecks.find(d => d.deck?.id === rule.toDeck?.id);
          let addCards = 0;
          const countCards = rule.count_cards;
          for (const card of cards) {
            if (card.table_deck.id === fromTableDeck.id) {
              card.table_deck = toTableDeck;
              card.hidden = rule.hidden;
              addCards++;
              if (toTableDeck.type === TableDeckType.TABLE) {
                card.position_x = height;
                card.position_y = width;
                width = width + 50;
                if (width >= 800) {
                  width = 0;
                  height = height + 75;
                }
              }
            }
            if (addCards >= countCards) {
              break;
            }
          }
        }));
      }

      return await this.tableCardsRepository.save(cards);
    } catch (error) {
      return error
    }
  }

  async leaveGame(table: TablesEntity) {
    try {
      const tableDB = await this.tablesRepository.findOne({ where: { id: new EqualOperator(table.id) }, relations: ['table_decks', 'table_users', 'table_decks.table_cards', 'ranks'] })

      await this.eraseDecksAndCards(table);
      await this.eraseTableRanks(tableDB);

      await Promise.all(tableDB.table_users.map(async (user) => {
        await this.tableUsersRepository.delete(user.id);
      }));
      // TODO: Set to finish after develop
      tableDB.status = TableStatus.WAITING;
      await this.tablesRepository.save(tableDB);

      return { error: false };
    } catch (error) {
      return error;
    }
  }

  async eraseDecksAndCards(table: TablesEntity) {
    try {
      const tableDB = await this.tablesRepository.findOne({ where: { id: new EqualOperator(table.id) }, relations: ['table_decks', 'table_users', 'table_decks.table_cards'] });

      await Promise.all(tableDB.table_decks.map(async (deck) => {
        await Promise.all(deck.table_cards.map(async (card) => {
          await this.tableCardsRepository.delete(card.id);
        }));
        await this.tableDecksRepository.delete(deck.id);
      }));

      tableDB.status = TableStatus.FINISH;
      return await this.tablesRepository.save(tableDB);
    } catch (error) {
      return error
    }
  }

  async eraseTableRanks(table: TablesEntity) {
    try {
      await Promise.all(table.ranks.map(async rank => {
        await this.rankRepository.delete(rank.id);
      }))
    } catch (error) {
      return error;
    }
  }

  async updateCard(card: TablesCardsEntity) {
    try {
      return await this.tableCardsRepository.save(card);
    } catch (error) {
      return error
    }
  }

  async setPlayerPlaying(tableUsers: TableUsersEntity[]) {
    try {
      return await this.tableUsersRepository.save(tableUsers);
    } catch (error) {
      return error
    }
  }

  async updateTableGameStatus(table: TablesEntity, status: TableStatus) {
    try {
      table.status = status;
      if (status === TableStatus.WAITING) {
        const tableDB = await this.tablesRepository.findOne({ where: { id: new EqualOperator(table.id) }, relations: ['ranks'] })
        this.eraseTableRanks(tableDB);
      }
      return await this.tablesRepository.save(table);
    } catch (error) {
      return error
    }
  }

  async setNextPlayer(table_users: TableUsersEntity[], nextPlayer: boolean) {
    try {
      const playingIndex = table_users.findIndex(user => user.playing);
      const nextIndex = nextPlayer ? playingIndex + 1 : playingIndex - 1;
      const nextPlayingIndex = (nextIndex + table_users.length) % table_users.length;

      table_users.forEach(user => user.playing = false);
      table_users[nextPlayingIndex].playing = true;

      return await this.tableUsersRepository.save(table_users);
    } catch (error) {
      return error;
    }
  }

  async shuffleDeck(tableDeckId: number) {
    try {
      const tableDeck = await this.tableDecksRepository.findOne({
        where: { id: new EqualOperator(tableDeckId) },
        relations: ['table_cards', 'table_cards.table_deck', 'table_cards.card']
      });
      return await this.shuffleCards(tableDeck.table_cards, [tableDeckId]);
    } catch (error) {
      return error;
    }
  }

  async updateRankTable(rankRow: StoreRankRow[], tableId: number) {
    try {
      const rankEntities: RankEntity[] = [];

      const tableDB = await this.tablesRepository.findOne({ where: { id: tableId } });

      const rankPromises = rankRow.map(async (rankData) => {
        const tableUserDB = await this.tableUsersRepository.findOne({ where: { id: rankData.table_user } });
        const rank = new RankEntity();
        rank.table = tableDB;
        rank.type = rankData.type;
        rank.title = rankData.title;
        rank.points = rankData.points;
        rank.row = rankData.row;
        rank.table_user = tableUserDB;
        return rank;
      });

      const resolvedRanks = await Promise.all(rankPromises);
      rankEntities.push(...resolvedRanks);

      return this.rankRepository.save(rankEntities);
    } catch (error) {
      return error;
    }
  }

  async getRankTable(tableId: number) {
    try {
      const ranks = await this.rankRepository.find({
        where: { table: new EqualOperator(tableId) },
        relations: ['table_user'],
        order: { row: 'ASC', type: 'ASC' }
      });

      const ranksByRow = [];
      let currentRow = -1;

      ranks.forEach(rank => {
        if (rank.row !== currentRow) {
          currentRow = rank.row;
          ranksByRow.push([]);
        }
        ranksByRow[ranksByRow.length - 1].push(rank);
      });

      return ranksByRow;
    } catch (error) {
      return error;
    }
  }

  async updateRankRow(ranks: RankEntity[]) {
    try {
      return await this.rankRepository.save(ranks);
    } catch (error) {
      return error
    }
  }

  async deleteRankRow(row: number, tableId: number) {
    try {
      const ranksDB = await this.rankRepository.find({ where: { table: new EqualOperator(tableId), row } });

      // const ranksPromises = ranksDB.map(async (rank) => {
      //   return await this.tableUsersRepository.delete(rank.id);
      // });

      const response = await Promise.all(ranksDB.map(rank => {
        return this.rankRepository.delete(rank.id);
      }));

      return await Promise.all(response);
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}
