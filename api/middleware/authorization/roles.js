const { AbilityBuilder, Ability } = require('@casl/ability');

const { ROLES } = require('@/utils');

const defineAbilityFor = role => {
  const { can, cannot, rules } = new AbilityBuilder();

  if (role === ROLES.superuser.value) {
    can('manage', 'all'); // read-write access to everything
  } else if (role === ROLES.seller.value) {
    can('read', 'all');
    can('update', 'proforma');
  }
  cannot('list', 'dispatch');

  return new Ability(rules);
};

module.exports = { defineAbilityFor };
