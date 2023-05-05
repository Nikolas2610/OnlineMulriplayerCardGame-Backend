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
import { SocketStatus } from '../types/SocketStatus.enum';
import { Server, Socket } from 'socket.io';

@Injectable()
export class OnlineTableService {

  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    @InjectRepository(TablesEntity)
    protected readonly tablesRepository: Repository<TablesEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(GamesEntity)
    private readonly gamesRepository: Repository<GamesEntity>,
    @InjectRepository(TableUsersEntity)
    protected readonly tableUsersRepository: Repository<TableUsersEntity>,
    @InjectRepository(TablesDecksEntity)
    protected readonly tableDecksRepository: Repository<TablesDecksEntity>,
    @InjectRepository(TablesCardsEntity)
    private readonly tableCardsRepository: Repository<TablesCardsEntity>,
    @InjectRepository(DecksEntity)
    private readonly decksRepository: Repository<DecksEntity>,
    @InjectRepository(HandStartCardsEntity)
    private readonly handStartCardsRepository: Repository<HandStartCardsEntity>,
    @InjectRepository(RankEntity)
    private readonly rankRepository: Repository<RankEntity>,
  ) { }

  async setOnlineSocketUser(userId: number, socketId: string, server: Server, client: Socket) {
    try {
      // Remove guest socket credentials
      const guestTableUserDB = await this.tableUsersRepository.findOne({ where: { socket_id: client.id } });
      if (guestTableUserDB) {
        guestTableUserDB.socket_id = null;
        guestTableUserDB.socket_status = SocketStatus.OFFLINE;
        await this.tableUsersRepository.save(guestTableUserDB);
      }

      // Get table user
      const tableUserDB = await this.tableUsersRepository.findOne({ where: { user: new EqualOperator(userId) }, relations: ['table'] });

      // If exists set the user online and return it  
      if (tableUserDB) {
        tableUserDB.socket_id = client.id;

        // load the the table data for the disconnected user
        if (tableUserDB.socket_status === SocketStatus.DISCONNECT) {
          const table = await this.loadTableGame(tableUserDB.table.id);
          server.to(client.id).emit('getLastGame', table);
          tableUserDB.socket_status = SocketStatus.LEAVE;
        } else {
          // Set online the socket user
          tableUserDB.socket_status = SocketStatus.ONLINE;
        }

        return await this.tableUsersRepository.save(tableUserDB);
      }

      // If user not exits add the user as online
      const tableUser = new TableUsersEntity();
      tableUser.socket_id = socketId;
      tableUser.user = await this.userRepository.findOne({ where: { id: userId } });
      tableUser.socket_status = SocketStatus.ONLINE;
      return await this.tableUsersRepository.save(tableUser);
    } catch (error) {
      return error
    }
  }

  async setOfflineSocketUser(userId: number) {
    try {
      const tableUser = await this.tableUsersRepository.findOne({ where: { user: new EqualOperator(userId) }, relations: ['table'] });
      if (tableUser) {
        tableUser.socket_status = SocketStatus.OFFLINE;
        tableUser.table = null;
        tableUser.role = null;
        tableUser.status = null;
        tableUser.team = null;
        tableUser.turn = null;
        return await this.tableUsersRepository.save(tableUser);
      }
    } catch (error) {
      return error
    }
  }

  async disconnectUser(socket_id: string) {
    try {
      // Get table user
      const tableUserDB = await this.tableUsersRepository.findOne({ where: { socket_id }, relations: ['table'] });

      if (tableUserDB) {
        // If user was in game before disconnect we set the socket status as disconnect otherwise as offline 
        if (tableUserDB.socket_status === SocketStatus.ROOM) {
          tableUserDB.socket_status = SocketStatus.DISCONNECT;
          tableUserDB.table.status = TableStatus.PLAYER_DISCONNECTED;
        } else {
          tableUserDB.socket_status = SocketStatus.OFFLINE;
        }
        return await this.tableUsersRepository.save(tableUserDB);
      }
    } catch (error) {
      return error
    }
  }

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
    const tables = await this.tablesRepository.find(
      {
        where: [
          { status: TableStatus.WAITING },
          { status: TableStatus.PLAYING },
          { status: TableStatus.PLAYER_LEAVE },
          { status: TableStatus.PLAYER_DISCONNECTED },
        ],
        relations: [
          'game',
          'creator',
          'table_users',
          'game_master',
          'game.deck',
          'game.deck.cards',
        ],
        order: {
          created_at: 'DESC',
        },
      }
    );

    // Custom sort function to prioritize 'WAITING' and 'PLAYING' statuses
    tables.sort((a, b) => {
      if (a.status === TableStatus.WAITING && b.status !== TableStatus.WAITING) {
        return -1;
      } else if (a.status !== TableStatus.WAITING && b.status === TableStatus.WAITING) {
        return 1;
      } else if (a.status === TableStatus.PLAYING && b.status !== TableStatus.PLAYING) {
        return -1;
      } else if (a.status !== TableStatus.PLAYING && b.status === TableStatus.PLAYING) {
        return 1;
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return tables;
  }

  async joinTable(data: JoinTable, client: Socket, server: Server) {
    try {
      const tableUserDB = await this.tableUsersRepository.findOne({ where: { socket_id: client.id }, relations: ['table'] });
      const tableDB = await this.tablesRepository.findOne({
        where: { id: new EqualOperator(data.tableId) },
        relations: ['table_users', 'game']
      })

      // Check if the table is full
      if (tableDB.table_users?.length >= tableDB.game?.max_players) {
        return { error: 'The table is full' };
      }

      // Catch to join only a leaver
      if ((tableDB.status === TableStatus.PLAYER_DISCONNECTED || tableDB.status === TableStatus.PLAYER_LEAVE) && tableUserDB.table?.id !== tableDB.id) {
        return { error: 'The table is accepting only the leavers' };
      }

      if (tableDB.status !== TableStatus.WAITING && tableDB.status !== TableStatus.PLAYER_DISCONNECTED && tableDB.status !== TableStatus.PLAYER_LEAVE) {
        return { error: 'The table is no longer waiting for disconnected or leaving players.' };
      }

      if (tableUserDB) {
        // Client join to room
        client.join(data.publicUrl);
        if (tableUserDB.socket_status === SocketStatus.LEAVE) {
          // Load cards and table for the leaver
          const cards = await this.getCardsTable(data.tableId);
          const response = await this.loadTableGame(data.tableId);
          server.to(client.id).emit('getStartGameDetails', response, cards);

          // Check if every player is connected to the table and update table status to playing
          let startGame = true;
          tableDB.table_users.forEach(user => {
            if (user.socket_status !== SocketStatus.ROOM && tableUserDB.id !== user.id) {
              startGame = false;
            }
          })
          if (startGame) {
            await this.updateTableGameStatus(tableDB, TableStatus.PLAYING);
          }
        }
        // Update Socket status
        tableUserDB.socket_status = SocketStatus.ROOM;
        // Set turn for the player
        const countTableUsers = await this.tableUsersRepository.count({ where: { table: new EqualOperator(data.tableId) } });
        tableUserDB.turn = countTableUsers + 1;
        tableUserDB.table = await this.tablesRepository.findOne({ where: { id: data.tableId } });
        return await this.tableUsersRepository.save(tableUserDB);
      }
      return { error: 'User not exists' };
    } catch (error) {
      return error
    }
  }

  async getCardsTable(tableId: number) {
    try {
      const tableDecks = await this.tableDecksRepository.find({
        where: { table: new EqualOperator(tableId) },
        relations: ['table_cards', 'table_cards.card', 'table_cards.table_deck', 'table_cards.table_deck.table_user', 'table_cards.table_deck.user']
      })
      return tableDecks.flatMap(deck => deck.table_cards);
    } catch (error) {
      return error;
    }
  }

  async leaveTable(userId: number, tableId: number) {
    try {
      // Get table user
      const tableUser = await this.tableUsersRepository.findOne({
        where: { user: new EqualOperator(userId), table: new EqualOperator(tableId) },
        relations: ['table']
      });

      // Update Socket user
      if (
        tableUser.table.status === TableStatus.PLAYING
        || tableUser.table.status === TableStatus.PLAYER_DISCONNECTED
        || tableUser.table.status === TableStatus.PLAYER_LEAVE
      ) {
        // Update player socket status
        tableUser.socket_status = SocketStatus.LEAVE
        const response = await this.tableUsersRepository.save(tableUser);

        // Update table status
        await this.updateTableGameStatus(tableUser.table, TableStatus.PLAYER_LEAVE);

        return response;
      }
      // Remove game details for the user has choose to leave
      tableUser.socket_status = SocketStatus.ONLINE;
      tableUser.status = null;
      tableUser.role = null;
      tableUser.team = null;
      tableUser.table = null;
      tableUser.turn = null;

      // Update table user
      const response = await this.tableUsersRepository.save(tableUser);
      // Update users turn
      await this.updatePlayerTurnOnLeave(tableId);
      // Return the response
      return response;
    } catch (error) {
      return error
    }
  }

  async updatePlayerTurnOnLeave(tableId: number) {
    try {
      const users = await this.tableUsersRepository.find({
        where: { table: new EqualOperator(tableId), socket_status: SocketStatus.ROOM },
        order: { turn: 'ASC' }
      })
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
          id,
        },
        relations: ['game', 'creator', 'table_users', 'game_master', 'game.deck', 'game.deck.cards', 'table_users.user', 'table_users.role', 'table_decks', 'table_decks.user', 'table_decks.deck', 'table_decks.table', 'table_decks.table_user', 'table_decks.table_user.user', 'table_decks.table_user.role', 'table_users.team', 'table_users.status', 'game.hand_start_cards', 'game.roles', 'game.teams', 'game.status'],
      })

      table.table_users = table.table_users.filter(user => user.socket_status === SocketStatus.ROOM);

      if (table) {
        // Sort users by the turn order
        table.table_users.sort((a, b) => a.turn - b.turn);
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

  async shuffleCards(cards: TablesCardsEntity[], tableDecks: number[], maxZIndex: number = null): Promise<TablesCardsEntity[]> {
    const shuffledCards: TablesCardsEntity[] = [];
    for (const deckId of tableDecks) {
      const deck = cards.filter(card => card.table_deck.id === deckId);
      // Fisher-Yates shuffle algorithm
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      // Update card
      let counter = maxZIndex;
      deck.forEach((card, index) => {
        card.turn = index;
        if (maxZIndex) {
          card.z_index = counter++;
        }
        shuffledCards.push(card);
      });
    }
    // Return the new save cards
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

  async exitTable(table: TablesEntity) {
    try {
      const tableDB = await this.tablesRepository.findOne({ where: { id: new EqualOperator(table.id) }, relations: ['table_decks', 'table_users', 'table_decks.table_cards', 'ranks', 'table_users.table'] })

      await this.eraseDecksAndCards(table);
      await this.eraseTableRanks(tableDB);

      await Promise.all(tableDB.table_users.map(async (user) => {
        user.socket_status = SocketStatus.ONLINE;
        user.role = null;
        user.team = null;
        user.status = null;
        user.table = null;
        user.turn = null;
        user.playing = false;
        await this.tableUsersRepository.save(user);
      }));

      // Not delete the tables on development environment
      if (process.env.NODE_ENV === 'development') {
        tableDB.status = TableStatus.WAITING;
      } else {
        tableDB.status = TableStatus.FINISH;
      }

      tableDB.table_users = [];
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
      // Get the max zIndex of the cards
      const maxZIndex = tableDeck.table_cards.reduce((max, card) => {
        return card.table_deck.id === tableDeck.id && card.z_index > max ? card.z_index : max;
      }, 0);
      return await this.shuffleCards(tableDeck.table_cards, [tableDeckId], maxZIndex);
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

      const response = await Promise.all(ranksDB.map(rank => {
        return this.rankRepository.delete(rank.id);
      }));

      return await Promise.all(response);
    } catch (error) {
      return error;
    }
  }
}
