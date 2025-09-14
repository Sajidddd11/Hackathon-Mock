const express = require('express');
const router = express.Router();
const database = require('../data/database');
const { validateMemberData, validateAge } = require('../utils/validators');

// Q1: Create Member - POST /api/members
router.post('/', (req, res) => {
  try {
    const { member_id, name, age } = req.body;
    
    // Validate required fields
    if (!member_id || !name || age === undefined) {
      return res.status(400).json({
        message: "Missing required fields: member_id, name, and age are required"
      });
    }
    
    // Validate age
    if (!validateAge(age)) {
      return res.status(400).json({
        message: `invalid age: ${age}, must be 12 or older`
      });
    }
    
    // Check if member already exists
    if (database.getMember(member_id)) {
      return res.status(400).json({
        message: `member with id: ${member_id} already exists`
      });
    }
    
    // Create member
    const memberData = { name, age };
    const member = database.createMember(memberData);
    
    // Update the member_id to match the request
    member.member_id = member_id;
    database.data.members.set(member_id, member);
    
    res.status(200).json({
      member_id: member.member_id,
      name: member.name,
      age: member.age,
      has_borrowed: member.has_borrowed
    });
    
  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

// Q2: Get Member Info - GET /api/members/{member_id}
router.get('/:member_id', (req, res) => {
  try {
    const memberId = parseInt(req.params.member_id);
    
    if (isNaN(memberId)) {
      return res.status(400).json({
        message: "Invalid member ID format"
      });
    }
    
    const member = database.getMember(memberId);
    
    if (!member) {
      return res.status(404).json({
        message: `member with id: ${memberId} was not found`
      });
    }
    
    res.status(200).json({
      member_id: member.member_id,
      name: member.name,
      age: member.age,
      has_borrowed: member.has_borrowed
    });
    
  } catch (error) {
    console.error('Error getting member:', error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

// Q3: List All Members - GET /api/members
router.get('/', (req, res) => {
  try {
    const members = database.getAllMembers();
    
    const memberList = members.map(member => ({
      member_id: member.member_id,
      name: member.name,
      age: member.age
    }));
    
    res.status(200).json({
      members: memberList
    });
    
  } catch (error) {
    console.error('Error listing members:', error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

// Q4: Update Member Info - PUT /api/members/{member_id}
router.put('/:member_id', (req, res) => {
  try {
    const memberId = parseInt(req.params.member_id);
    const { name, age } = req.body;
    
    if (isNaN(memberId)) {
      return res.status(400).json({
        message: "Invalid member ID format"
      });
    }
    
    // Check if member exists
    const existingMember = database.getMember(memberId);
    if (!existingMember) {
      return res.status(404).json({
        message: `member with id: ${memberId} was not found`
      });
    }
    
    // Validate age if provided
    if (age !== undefined && !validateAge(age)) {
      return res.status(400).json({
        message: `invalid age: ${age}, must be 12 or older`
      });
    }
    
    // Update member
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (age !== undefined) updateData.age = age;
    
    const updatedMember = database.updateMember(memberId, updateData);
    
    res.status(200).json({
      member_id: updatedMember.member_id,
      name: updatedMember.name,
      age: updatedMember.age,
      has_borrowed: updatedMember.has_borrowed
    });
    
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

// Q9: Delete Member - DELETE /api/members/{member_id}
router.delete('/:member_id', (req, res) => {
  try {
    const memberId = parseInt(req.params.member_id);
    
    if (isNaN(memberId)) {
      return res.status(400).json({
        message: "Invalid member ID format"
      });
    }
    
    // Check if member exists
    const member = database.getMember(memberId);
    if (!member) {
      return res.status(404).json({
        message: `member with id: ${memberId} was not found`
      });
    }
    
    // Check if member has active borrowings
    const activeTransactions = database.getActiveTransactions()
      .filter(t => t.member_id === memberId);
    
    if (activeTransactions.length > 0) {
      return res.status(400).json({
        message: `cannot delete member with id: ${memberId}, member has an active book borrowing`
      });
    }
    
    // Delete member
    const deleted = database.deleteMember(memberId);
    
    if (deleted) {
      res.status(200).json({
        message: `member with id: ${memberId} has been deleted successfully`
      });
    } else {
      res.status(500).json({
        message: "Failed to delete member"
      });
    }
    
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

// Q8: Get Borrowing History - GET /api/members/{member_id}/history
router.get('/:member_id/history', (req, res) => {
  try {
    const memberId = parseInt(req.params.member_id);
    
    if (isNaN(memberId)) {
      return res.status(400).json({
        message: "Invalid member ID format"
      });
    }
    
    // Check if member exists
    const member = database.getMember(memberId);
    if (!member) {
      return res.status(404).json({
        message: `member with id: ${memberId} was not found`
      });
    }
    
    const history = database.getMemberBorrowingHistory(memberId);
    
    res.status(200).json(history);
    
  } catch (error) {
    console.error('Error getting borrowing history:', error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

module.exports = router;
