const Task = require("../models/Task.model");
const Group = require("../models/Group.model");

function getGroupInfo(groupId, next) {
  return Group.findById(groupId)
    .select("members recurringTasks weekNumber weekEndDate -_id")
    .populate("members", ["name"])
    .then((groupInfo) => {
       return {
        members: groupInfo.members,
        recurringTasks: groupInfo.recurringTasks,
        weekNumber: groupInfo.weekNumber,
        weekEndDate: groupInfo.weekEndDate,
      };
    })
    .catch((error) => {
      console.error(`Error while fetching group info for ${groupId}->`, error);
      next(error);
    });
}

function getThisWeeksTasks(groupId, weekNumber, next) {
  return Task.find({
    $and: [{ group: groupId }, { weekNumber: weekNumber }],
  })
    .then((foundTasks) => {
      return foundTasks;
    }).catch((error) => {
      console.error(
        `Failed to fetch tasks for group ${groupId} week ${weekNumber} ->`,
        error
      );
      next(error);
    });
}

function saveTasksInDB(newTasks, next) {

  return Task.insertMany(newTasks)
    .then((createdTasks) => {
      return createdTasks;
    })
    .catch((error) => {
      console.error("Error while saving the tasks for the week ->", error);
      next(error);
    });

}

function updateWeekEndDateAndNumber(groupId, newWeekNumber, endDate, next) {
  return Group.findByIdAndUpdate(
    groupId,
    {
      weekNumber: newWeekNumber,
      weekEndDate: endDate,
    },
    { new: true }
  ).then((updatedGroup) => {
      return {
        weekEndDate: updatedGroup.weekEndDate,
        weekNumber: updatedGroup.weekNumber,
      };
    })
    .catch((error) => {
      console.error("Error while updating the group after creating the tasks for the week ->", error);
      next(error);
    });
}

module.exports = {
  getGroupInfo,
  getThisWeeksTasks,
  saveTasksInDB,
  updateWeekEndDateAndNumber,
};
