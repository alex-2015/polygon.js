var assert = require('assert');
var Polygon = require('../polygon');
var Vec2 = require('vec2');

describe('Polygon', function() {

  describe('#constructor', function() {
    it('should take an array of vec2s', function() {
      var p = new Polygon([
        Vec2(1,2),
        Vec2(100,200),
        Vec2(0,200)
      ]);

      assert.equal(p.points.length, 3);
    });
  });

  describe('#each', function() {
    it('should return the prev, current, next, and idx', function() {
      var p = new Polygon([
        Vec2(1,2),
        Vec2(100,200),
        Vec2(0,200)
      ]);

      p.each(function(prev, current, next, idx) {

        if (idx === 0) {
          assert.equal(prev, p.points[2]);
          assert.equal(current, p.points[0]);
          assert.equal(next, p.points[1]);
        }

        if (idx === 1) {
          assert.equal(prev, p.points[0]);
          assert.equal(current, p.points[1]);
          assert.equal(next, p.points[2]);
        }

        if (idx === 2) {
          assert.equal(prev, p.points[1]);
          assert.equal(current, p.points[2]);
          assert.equal(next, p.points[0]);
        }
      });
    });

    it('should allow exiting early', function() {
      var p = new Polygon([
        Vec2(1,2),
        Vec2(100,200),
        Vec2(0,200)
      ]);

      p.each(function(prev, current, next, idx) {
        assert.equal(idx, 0);
        return false;
      });
    });
  });


  describe('#area', function() {
    it('it should properly compute the area of a triangle', function() {
      var p = new Polygon([
        Vec2(200,200),
        Vec2(200,0),
        Vec2(0,0)
      ]);

      var area = p.area();

      assert.equal(area, 200*200/2);
    });

    it('it should properly compute the area of a square', function() {
      var p = new Polygon([
        Vec2(0,200),
        Vec2(200,200),
        Vec2(200,0),
        Vec2(0,0)
      ]);

      var area = p.area();

      assert.equal(area, 200*200);
    });
  });

  describe('#winding', function() {

    it('should detect a polygon wound clockwise', function() {
      var p = new Polygon([
        Vec2(200,200),
        Vec2(200,0),
        Vec2(0,0)
      ]);

      assert.ok(p.winding());
    });

    it('should detect a polygon wound counterclockwise', function() {
      var p = new Polygon([
        Vec2(0,0),
        Vec2(200,0),
        Vec2(200,200)
      ]);

      assert.ok(!p.winding());
    });
  });

  describe('#rewind', function() {
    it('should rewind a counterclockwise to clockwise', function() {

      var p = new Polygon([
        Vec2(0,0),
        Vec2(200,0),
        Vec2(200,200)
      ]);

      assert.ok(!p.winding());
      p.rewind(true);
      assert.ok(p.winding());
    });


    it('should rewind a clockwise to counterclockwise', function() {
      var p = new Polygon([
        Vec2(200,200),
        Vec2(200,0),
        Vec2(0,0)
      ]);

      assert.ok(p.winding());
      p.rewind(false);
      assert.ok(!p.winding());
    });


    it('should rewind an arbitrary polygon to the winding specified', function() {
      var p = new Polygon([
        Vec2(200,200),
        Vec2(200,0),
        Vec2(0,0)
      ]);

      p.rewind(false);
      assert.ok(!p.winding());

      p.rewind(true);
      assert.ok(p.winding());
    });
  });

  describe('#closestPointTo', function() {
    it('should identify the closest point in the polygon to the incoming vector', function() {
      var p = new Polygon([
        Vec2(200,200),
        Vec2(200,0),
        Vec2(0,0)
      ]);

      var point = p.closestPointTo(Vec2(300,300));
      assert.equal(point.x, 200);
      assert.equal(point.y, 200);

      assert.deepEqual(point.current, p.points[0]);
      assert.deepEqual(point.next, p.points[1]);
      assert.deepEqual(point.prev, p.points[2]);
      assert.equal(point.distanceToCurrent, 141.4213562373095);

    });

    it('should identify the closest point in the polygon to the incoming vector', function() {
      var p = new Polygon([
        Vec2(0,200),
        Vec2(200,200),
        Vec2(200,0),
        Vec2(0,0)
      ]);

      var point = p.closestPointTo(Vec2(300,100));
      assert.equal(point.x, 200);
      assert.equal(point.y, 100);
      assert.ok(!point.current);
      assert.equal(point.distanceToCurrent, 100);
    });
  });

  describe('#dedupe', function() {
    it('should remove dupes', function() {
      assert.equal(Polygon([
        Vec2(10, 10),
        Vec2(10, 10),
        Vec2(20, 10),
        Vec2(20, 20),
      ]).dedupe().points.length, 3)
    });

    it('should return a new instance if specified', function() {
      p = Polygon([
        Vec2(10, 10),
        Vec2(10, 10),
        Vec2(20, 10),
        Vec2(20, 20),
      ]);
      var p2 = p.dedupe(true);
      assert.equal(3, p2.points.length);
      assert.equal(4, p.points.length);
    });
  });

  describe('#containsPoint', function() {
    it('should return true when a vec is inside of the poly', function() {
      assert.ok(Polygon([
        Vec2(0,0),
        Vec2(10,0),
        Vec2(10,10),
        Vec2(0,10)
      ]).containsPoint(Vec2(5,5)));
    });

    it('should return false when a vec is outside of a poly', function() {
      assert.ok(!Polygon([
        Vec2(0,0),
        Vec2(10,0),
        Vec2(10,10),
        Vec2(0,10)
      ]).containsPoint(Vec2(50,5)));
    });

    it('should work even if exiting through a single point', function() {
      var p = Polygon([
        Vec2(50, 50),
        Vec2(50, 200),
        Vec2(500, 125)
      ]);

      assert.ok(!p.containsPoint(Vec2(520, 125)));
    });

    it('[outside] should work even if entering and exiting through a single point', function() {
      var p = Polygon([
        Vec2(300, 300),
        Vec2(320, 350),
        Vec2(300, 400),
        Vec2(400, 400),
        Vec2(450, 450),
        Vec2(400, 200),
        Vec2(400, 100)
      ], 20);

      assert.ok(!p.containsPoint(Vec2(400, 100)));
    });


    it('[outside] should work even if entering and exiting through a two points', function() {
      var p = Polygon([
        Vec2(50, 50),
        Vec2(100, 0),
        Vec2(150, 50),
        Vec2(50, 100)
      ], 20);

      assert.ok(!p.containsPoint(Vec2(200, 5)));
    });

    it('[inside] should work even if entering through a point', function() {
      var p = Polygon([
        Vec2(50, 50),
        Vec2(100, 0),
        Vec2(150, 50),
        Vec2(50, 100)
      ], 20);

      assert.ok(p.containsPoint(Vec2(100, 50)));
    });

  });

  describe('#remove', function() {
    it('should remove the passed vec2', function() {
      var p = Polygon([
        Vec2(0,0),
      ]);

      p.remove(p.point(0));
      assert.equal(0, p.length);
    });

    it('return this', function() {
      var p = Polygon([
        Vec2(0,0),
      ]);

      assert.ok(p === p.remove(p.point(0)));
    });

  });

  describe('#clean', function() {
    it('should clean identical points occurring right after each other', function() {

      var p = Polygon([
        Vec2(0,0),
        Vec2(0,0),
        Vec2(1, 1),
        Vec2(3, 3),
      ]);

      p.clean();

      assert.equal(p.points.length, 3);
      assert.ok(p.points[0].equal(0, 0));
      assert.ok(p.points[1].equal(1, 1));
      assert.ok(p.points[2].equal(3, 3));

    });

    it('should leave identical points that are not immediately connected', function() {
      var p = Polygon([
        Vec2(0,0),
        Vec2(1, 1),
        Vec2(0,0),
        Vec2(3, 3),
      ]);

      p.clean();

      assert.equal(p.points.length, 4);
      assert.ok(p.points[0].equal(0, 0));
      assert.ok(p.points[1].equal(1, 1));
      assert.ok(p.points[2].equal(0, 0));
      assert.ok(p.points[3].equal(3, 3));
    });

    it('should remove the loop if exists', function() {
      var p = Polygon([
        Vec2(0,0),
        Vec2(1, 1),
        Vec2(3, 3),
        Vec2(0,0),
      ]);

      p.clean();

      assert.equal(p.points.length, 3);
      assert.ok(p.points[0].equal(1, 1));
      assert.ok(p.points[1].equal(3, 3));
      assert.ok(p.points[2].equal(0, 0));
    });

    it('should return a new polygon if requested', function() {
      var p = Polygon([
        Vec2(0,0),
        Vec2(0,0),
        Vec2(1, 1),
        Vec2(3, 3),
      ]);

      var p2 = p.clean(true);
      assert.equal(3, p2.points.length);
      assert.equal(4, p.points.length);
    })

  });

  describe('#clone', function() {
    it('should clone the object and all vecs', function() {
      var p = Polygon([
        Vec2(0,0),
        Vec2(1, 1),
        Vec2(3, 3),
        Vec2(0,0),
      ]);

      var p2 = p.clone();

      assert.equal(p.length, p2.length);
      assert.deepEqual(p, p2);
      p2.each(function(prev, c, n, idx) {
        assert.equal(c.x, p.points[idx].x);
        assert.equal(c.y, p.points[idx].y);
        assert.ok(c !== p.points[idx]);
      });
    });
  });

  describe('#aabb', function() {
    it('should return a box that contains all of the points', function() {

      var p = Polygon([
        Vec2(300, 300),
        Vec2(320, 350),
        Vec2(300, 400),
        Vec2(400, 400),
        Vec2(450, 450),
        Vec2(400, 200),
        Vec2(400, 100)
      ], 20);

      var aabb = p.aabb();
      assert.equal(aabb.x, 300);
      assert.equal(aabb.y, 100);
      assert.equal(aabb.w, 150);
      assert.equal(aabb.h, 350);
    });

    it('should not explode when there are no points', function() {
      var p = Polygon();
      var aabb = p.aabb();
      assert.equal(aabb.x, 0);
      assert.equal(aabb.y, 0);
      assert.equal(aabb.w, 0);
      assert.equal(aabb.h, 0);      
    });
  });

  describe('#containsPolygon', function() {

    it('should return true if the subject polygon is completely contained', function() {
      var p = new Polygon([
        Vec2(0,0),
        Vec2(100,0),
        Vec2(100,100),
        Vec2(0,100)
      ]);

      var p2 = new Polygon([
        Vec2(10,10),
        Vec2(90,10),
        Vec2(90,90),
        Vec2(10,90)
      ]);

      assert.ok(p.containsPolygon(p2))
    })

    it('should return false if the subject polygon is not completely contained', function() {
      var p = new Polygon([
        Vec2(0,0),
        Vec2(100,0),
        Vec2(100,100),
        Vec2(0,100)
      ]);

      var p2 = new Polygon([
        Vec2(-10,-10),
        Vec2(90,10),
        Vec2(90,90),
        Vec2(10,90)
      ]);

      assert.ok(!p.containsPolygon(p2))
    });
  });

  describe('#offset', function() {
    var p = Polygon([
      Vec2(10, 10),
      Vec2(10, 100),
      Vec2(100, 100),
      Vec2(100, 10)
    ]).rewind(true);

    var offset = p.offset(-10);
    offset.each(function(p, c) {
      assert.equal(c.distance(c.point), 14.142135623730951);
    });
  });

  describe('#point', function() {
    it('should return the index specified', function() {
      var p = Polygon([
        Vec2(10, 10),
        Vec2(10, 100),
        Vec2(100, 100),
        Vec2(100, 10)
      ]);

      assert.ok(p.point(0).equal(Vec2(10, 10)));
      assert.ok(p.point(-1).equal(Vec2(100, 10)));
      assert.ok(p.point(4).equal(Vec2(10, 10)));
      assert.ok(p.point(8).equal(Vec2(10, 10)));
      assert.ok(p.point(-4).equal(Vec2(10, 10)));
    });
  });

  describe('#center', function() {
    it('should return a vec2 at the center', function() {
      var p = Polygon([
        Vec2(0, 0),
        Vec2(10, 0),
        Vec2(10, 10),
        Vec2(0, 10),
      ]);

      assert.ok(p.center().equal(Vec2(5, 5)));
    });
  });

  describe('#scale', function() {

    it('should scale from the center by default', function() {
      var p = Polygon([
        Vec2(0, 0),
        Vec2(10, 0),
        Vec2(10, 10),
        Vec2(0, 10),
      ]);

      p.scale(Vec2(10, 1));
      assert.ok(Vec2(-45, 0).equal(p.point(0)));
      assert.ok(Vec2(55, 0).equal(p.point(1)));
      assert.ok(Vec2(55, 10).equal(p.point(2)));
      assert.ok(Vec2(-45, 10).equal(p.point(3)));
      assert.ok(p.center().equal(Vec2(5, 5)));

      p.scale(Vec2(1, 10));
      assert.ok(Vec2(-45, -45).equal(p.point(0)));
      assert.ok(Vec2(55, -45).equal(p.point(1)));
      assert.ok(Vec2(55, 55).equal(p.point(2)));
      assert.ok(Vec2(-45, 55).equal(p.point(3)));

      assert.ok(p.center().equal(Vec2(5, 5)));
    });

    it('should scale from an abitrary point when specified', function() {
      var p = Polygon([
        Vec2(0, 0),
        Vec2(10, 0),
        Vec2(10, 10),
        Vec2(0, 10),
      ]);

      p.scale(Vec2(10, 1), Vec2(0, 0));
      assert.ok(Vec2(0, 0).equal(p.point(0)));
      assert.ok(Vec2(100, 0).equal(p.point(1)));
      assert.ok(Vec2(100, 10).equal(p.point(2)));
      assert.ok(Vec2(0, 10).equal(p.point(3)));

      assert.ok(p.center().equal(Vec2(50, 5)));

      p.scale(Vec2(1, 10), Vec2(0, 0));
      assert.ok(Vec2(0, 0).equal(p.point(0)));
      assert.ok(Vec2(100, 0).equal(p.point(1)));
      assert.ok(Vec2(100, 100).equal(p.point(2)));
      assert.ok(Vec2(0, 100).equal(p.point(3)));

      assert.ok(p.center().equal(Vec2(50, 50)));
    });

    it('should chain', function() {
      var p = Polygon();
      assert.equal(p, p.scale(10));
    });

    it('should return a new polygon if returnNew is specified', function() {
      var p = Polygon([
        Vec2(10, 10)
      ]);

      var p2 = p.scale(Vec2(10, 1), null, true);
      assert.ok(Vec2(100, 10).equal(p2.point(0)));
      assert.ok(Vec2(10, 10).equal(p.point(0)));
    });
  });

  describe('#lines', function() {
    it('should iterate and call back with pairs', function() {
      var p = Polygon([
        Vec2(0, 0),
        Vec2(10, 0),
        Vec2(10, 10),
        Vec2(0, 10)
      ]);

      var count = 0;
      p.lines(function(start, end, idx) {
        assert.equal(idx, count);

        assert.ok(start.equal(p.point(count)));
        count++
        assert.ok(end.equal(p.point(count)));
      });
    });

    it('should chain', function() {
      var p = Polygon();
      assert.equal(p, p.lines(function() {}));
    });
  });

  describe('#line', function() {
    it('should return an array', function() {
      var p = Polygon([
        Vec2(0, 0),
        Vec2(10, 0),
        Vec2(10, 10),
        Vec2(0, 10)
      ]);    

      var line0 = p.line(0);
      assert.ok(line0[0].equal(p.point(0)));
      assert.ok(line0[1].equal(p.point(1)));

      var line1 = p.line(1);
      assert.ok(line1[0].equal(p.point(1)));
      assert.ok(line1[1].equal(p.point(2)));

      var line2 = p.line(2);
      assert.ok(line2[0].equal(p.point(2)));
      assert.ok(line2[1].equal(p.point(3)));

      var line3 = p.line(3);
      assert.ok(line3[0].equal(p.point(3)));
      assert.ok(line3[1].equal(p.point(4)));

      var line4 = p.line(4);
      assert.ok(line4[0].equal(p.point(4)));
      assert.ok(line4[1].equal(p.point(5)));
    });
  });

});
