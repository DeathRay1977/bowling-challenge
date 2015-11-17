function ScoreCard() {
  this.currentFrame = 1;
  this.currentBallInFrame = 1;
  this.maxFrames = 10;
  this.cumulativeScore = 0;
  this.frames = [];
  this.frames.push(new Frame(this.currentFrame));
}

ScoreCard.prototype.mark = function(pins) {
  this.getFrame(this.currentFrame).setBall(this.currentBallInFrame, pins);
  this.currentBallInFrame++;
  this.checkIfNewFrameNeeded(this.currentFrame);
  this.checkForUnfinalisedFrames();
}

ScoreCard.prototype.totalForFrame = function() {
  return this.getFrame(this.currentFrame).totalForFrame;
}

ScoreCard.prototype.checkForUnfinalisedFrames = function() {
  for (var f = 0; f < this.frames.length; f++) {
    if (!this.frames[f].scoreCalculated) {
      this.finaliseScoreUnderTen(f);
      this.finaliseStrike(f);
      this.finaliseSpare(f)
    }
  }
}

ScoreCard.prototype.finaliseScoreUnderTen = function(frame) {
  if (this.frames[frame].isStrike()) {
    return;
  }
  if (this.frames[frame].isSpare()) {
    return;
  }
  if (this.frames[frame].scoreCanBeFinalised()) {
    this.finalise(frame, this.frames[frame.total()]);
  }
}

ScoreCard.prototype.finaliseStrike = function(frame) {
  if (!this.frames[frame].isStrike()) {
    return;
  }
  if (!this.frames[frame + 1].scoreCalculated &&
    !this.frames[frame + 1].isStrike()) {
    return;
  }
  this.checkStrikeBonus(frame);
  this.checkTripleStrike(frame);
}

ScoreCard.prototype.checkStrikeBonus = function(frame) {
  this.checkStrikeBonusNotLastFrame(frame);
  this.checkStrikeBonusLastFrame(frame);
}

ScoreCard.prototype.checkStrikeBonusNotLastFrame = function(frame) {
  if (this.frameNumber === 10) {return;}
  if (!this.frames[frame + 1].isStrike()) {
    this.finalise(frame, this.frames[frame].total() +
      this.frames[frame + 1].firstTwoBalls())
  }
}

ScoreCard.prototype.checkStrikeBonusLastFrame = function(frame) {
  if (this.frameNumber !== 10) {return;}
  if (!this.frames[frame + 1].isStrike()) {
    this.finalise(frame, this.frames[frame].total() +
      this.frames[frame + 1].firstTwoBalls())
  }
}

ScoreCard.prototype.checkTripleStrike = function(frame) {
  this.checkTripleStrikeNotLastFrame();
  this.checkTripleStrikeLastFrame();
}

ScoreCard.prototype.checkTripleStrikeNotLastFrame = function(frame) {
  if (this.frameNumber === 10) {return;}
  if (this.frames[frame + 1].isStrike() && this.frames[frame + 2].isStrike()) {
    this.finalise(frame, this.frames[frame].total() +
      this.frames[frame + 1].firstBall() +
      this.frames[frame + 2].firstBall());
  }
}

ScoreCard.prototype.checkTripleStrikeLastFrame = function(frame) {
  if (this.frameNumber !== 10) {return;}
  if (this.frames[frame + 1].isStrike() && this.frames[frame + 2].isStrike()) {
    this.finalise(frame, this.frames[frame].total() +
      this.frames[frame + 1].firstBall() +
      this.frames[frame + 2].firstBall());
  }
}

ScoreCard.prototype.finaliseSpare = function(frame) {
  if (!this.frames[frame].isSpare()) {
    return;
  }
  if (this.frames[frame + 1].currentBall > 1) {
    this.finalise(frame, this.frames[frame].total() +
      this.frames[frame + 1].firstBall());
  }
}

ScoreCard.prototype.finalise = function(frame, totalForFrame) {
  this.cumulativeScore = this.cumulativeScore + totalForFrame;
  this.frames[frame].finalise(this.cumulativeScore);
}

ScoreCard.prototype.checkIfNewFrameNeeded = function(frame) {
  if (this.frames.length >= this.maxFrames) {return;}
  //
  // Case where it is not the final frame and two rolls have already
  // taken place. Create a new one and make it current.
  //
  if (this.isStrike(frame) ||
    (this.getFrame(frame).frameNumber < this.maxFrames &&
      this.currentBallInFrame === 3)) {
    this.frames.push(new Frame(frame + 1));
    this.currentFrame++;
    this.currentBallInFrame = 1;
    return this.frames[frame];
  }
}

ScoreCard.prototype.isStrike = function(frame) {
  return this.frames[frame - 1].isStrike();
}

ScoreCard.prototype.isSpare = function(frame) {
  return this.frames[frame - 1].isSpare();
}

ScoreCard.prototype.card = function() {
  return this.frames.map(function(frame) {
    return frame.totalForFrame;
  });
}

ScoreCard.prototype.getFrame = function(frame) {
  //
  // There is a frame in progress and it only has one roll.
  //
  return this.frames[frame - 1];
}
