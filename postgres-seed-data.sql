
-- Insert a dispute
INSERT INTO dispute (transaction_id, reason)
VALUES ('T8920719059', 'I did not receive the product, merchant not responding');

-- Submitted by U6656533455 (dbradick2)
INSERT INTO dispute_status_log (dispute_id, status, user_id, time, is_current)
SELECT id, 'Submitted', 'U6656533455', '2020-09-12T02:51:00Z', FALSE
FROM dispute WHERE transaction_id = 'T8920719059';

-- Accepted by U2345326336 ()
INSERT INTO dispute_status_log (dispute_id, status, user_id, time, is_current)
SELECT id, 'Accepted', 'U2345326336', '2020-09-16T12:22:00Z', TRUE
FROM dispute WHERE transaction_id = 'T8920719059';


-- Insert a dispute
INSERT INTO dispute (transaction_id, reason)
VALUES ('T1656871691', 'I have not made this purchase');

-- Submitted by U6656533455 (khatrick6)
INSERT INTO dispute_status_log (dispute_id, status, user_id, time, is_current)
SELECT id, 'Submitted', 'U6656533455', '2020-10-01T15:13:00Z', TRUE
FROM dispute WHERE transaction_id = 'T1656871691';