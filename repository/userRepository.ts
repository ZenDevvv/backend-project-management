// Description: Repository for user model.
// Used for database operations related to user model.
import { FilterQuery, UpdateQuery } from "mongoose";
import User, { UserModel } from "../models/userModel";

interface DbParams {
  query?: any;
  options?: {
    populateArray?: any[];
    select?: string;
    lean?: boolean;
    sort?: any;
    limit?: number;
  };
}

const userRepository = {
  getUser,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  searchUser,
  searchAndUpdate,
};

export default userRepository;

async function getUser(id: string, dbParams: DbParams = {}): Promise<UserModel | null> {
  let query = User.findById(id);

  (dbParams.options?.populateArray || []).forEach((populateOption) => {
    query = query.populate(populateOption);
  });

  const options = {
    select: dbParams.options?.select || "_id",
    lean: dbParams.options?.lean || true,
  };

  query = query.select(options.select);

  return query.exec();
}

async function getUsers(dbParams: DbParams): Promise<UserModel[]> {
  let query = User.find(dbParams.query);

  (dbParams.options?.populateArray || []).forEach((populateOption) => {
    query = query.populate(populateOption);
  });

  const options = {
    sort: dbParams.options?.sort || {},
    limit: dbParams.options?.limit || 10,
    select: dbParams.options?.select || "_id",
    lean: dbParams.options?.lean || true,
  };

  query = query.sort(options.sort).limit(options.limit).select(options.select);

  return query.exec();
}

async function createUser(data: Partial<UserModel>): Promise<UserModel | null> {
  let user = await User.create(data);
  const userWithoutPassword = await User.findById(user.id).select("-password").lean();
  return userWithoutPassword as UserModel | null;
}

async function updateUser(id: string, data: Partial<UserModel>): Promise<UserModel | null> {
  return await User.findByIdAndUpdate(id, data, { new: true });
}

async function deleteUser(id: string): Promise<UserModel | null> {
  return await User.findByIdAndDelete(id);
}

async function searchUser(query: string): Promise<UserModel[]> {
  return User.find(
    {
      $text: { $search: query },
    },
    {
      score: { $meta: "textScore" },
    }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(20);
}

async function searchAndUpdate(
  query: FilterQuery<UserModel>,
  update?: UpdateQuery<UserModel>,
  options?: { multi?: boolean }
): Promise<UserModel | null | { modifiedCount: number }> {
  if (update) {
    if (options?.multi) {
      const result = await User.updateMany(query, update);
      return { modifiedCount: result.modifiedCount };
    } else {
      return await User.findOneAndUpdate(query, update, { new: true });
    }
  } else {
    return await User.findOne(query);
  }
}
