/* eslint-disable camelcase */
import RequestServices from '../services/RequestServices';
import database from '../database/models';
import eventEmitter from '../utils/EventEmitter';

const { confirmRequestOwner, findRequestById, findCommentById } = RequestServices;

/**
 * @class CommentController
 */
class CommentController {
  /**
      * @method createComment
      * @param {Object} req request
      * @param {Oject} res request
      * @returns {Object} object
      */
  static async createComment(req, res) {
    const user_id = Number(req.user.id);
    const request_id = Number(req.params.request_id);
    if (!request_id) return res.status(400).send({ status: 400, error: 'Invalid request Id parameters' });
    const request = await findRequestById(request_id);
    if (!request) return res.status(404).send({ status: 404, error: 'Request not found' });
    // confirm his request
    const result = await confirmRequestOwner(request_id, user_id);
    if (result || req.user.role_value > 1) {
      const comment = req.body.comment.toLowerCase();
      const sentData = await database.Comment.create({
        request_id,
        user_id,
        comment
      });
      // emit notification Event
      const data = sentData.dataValues;
      data.from = req.user.id;
      eventEmitter.emit('new_comment', data);
      // post comment on req
      return res.status(200).send({ status: 200, message: 'comment posted', data });
    }
    return res.status(401).send({ status: 401, error: 'Not allowed' });
  }

  /**
      * @method getUserRequestcomments
      * @param {Object} req request
      * @param {Oject} res request
      * @returns {Object} object
      */
  static async getUserRequestComments(req, res) {
    const id = Number(req.user.id);
    const request_id = Number(req.params.request_id);
    // check if request exists
    const request = await findRequestById(request_id);
    if (!request) return res.status(404).send({ status: 404, error: 'Request not found' });

    // confirm his request
    const result = await confirmRequestOwner(request_id, id);
    // get all comments with request_id

    if (result || req.user.role_value > 1) {
      const comments = await database.Comment.findAll({
        where: { request_id, active: 'true' },
        order: [['createdAt', 'DESC']],
        include: [{
          model: database.User,
          attributes:
            ['id', 'firstname', 'lastname', 'image_url'],
          required: true
        }],
      });
      return res.status(200).send({ status: 200, message: `comments from the request with id :${request_id}`, data: comments });
    }
    if (!result) return res.status(401).send({ status: 401, error: 'Not allowed' });
  }

  /**
      * @method editRequestComments
      * @param {Object} req request
      * @param {Oject} res request
      * @returns {Object} object
      */
  static async editRequestComment(req, res) {
    const id = Number(req.user.id);
    const request_id = Number(req.params.request_id);
    const comment_id = Number(req.params.comment_id);
    const { comment } = req.body;

    if (!comment_id || !request_id) return res.status(400).send({ status: 400, error: 'Invalid request Id parameters' });
    const request = await findRequestById(request_id);
    if (!request) return res.status(404).send({ status: 404, error: 'Request not found' });
    // check if comments exist by get comment, compare user id
    const foundComment = await findCommentById(comment_id);
    if (!foundComment) return res.status(404).send({ status: 404, error: 'Comment not found' });
    if (foundComment.user_id !== id) return res.status(401).send({ status: 401, error: 'Not allowed' });

    // update comment
    await database.Comment.update(
      { comment }, { where: { id: comment_id } }
    );
    return res.status(200).send({ status: 200, comment });
  }

  /**
      * @method deleteComments
      * @param {Object} req request
      * @param {Oject} res request
      * @returns {Object} object
      */
  static async deleteComment(req, res) {
    const id = Number(req.user.id);
    const request_id = Number(req.params.request_id);
    const comment_id = Number(req.params.comment_id);

    if (!comment_id || !request_id) return res.status(400).send({ status: 400, error: 'Invalid request Id parameters' });
    const request = await findRequestById(request_id);
    if (!request) return res.status(404).send({ status: 404, error: 'Request not found' });
    // check if comments exist by get comment, compare user id
    const foundComment = await findCommentById(comment_id);
    if (!foundComment) return res.status(404).send({ status: 404, error: 'Comment not found' });
    if (foundComment.user_id !== id) return res.status(401).send({ status: 401, error: 'Not allowed' });
    try {
      await database.Comment.update(
        { active: false }, { where: { id: comment_id } }
      );
      return res.status(200).send({ status: 200, message: 'comment deleted' });
    } catch (err) {
      throw new Error('Error in database connection');
    }
  }
}

export default CommentController;
